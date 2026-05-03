const ROLE = {
  BUYER: "buyer",
  AGENT: "agent"
};

const INTENT = {
  PRICE_SENSITIVE_BUYER: "price_sensitive_buyer",
  URGENT_BUYER: "urgent_buyer",
  INVESTOR_BUYER: "investor_buyer",
  EXPLORER_BUYER: "explorer_buyer",
  FIRM_AGENT: "firm_agent",
  FLEXIBLE_AGENT: "flexible_agent",
  CLOSER_AGENT: "closer_agent",
  PASSIVE_AGENT: "passive_agent"
};

const TONE = {
  ASSERTIVE: "assertive",
  BALANCED: "balanced",
  WARM: "warm"
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundToNearest(value, step = 1000) {
  return Math.round(value / step) * step;
}

function percentageDiff(base, compare) {
  if (!base) return 0;
  return ((compare - base) / base) * 100;
}

function money(value) {
  return `RM ${Number(value).toLocaleString("en-MY")}`;
}

function inferRole(message = "", explicitRole) {
  if (explicitRole && Object.values(ROLE).includes(explicitRole)) return explicitRole;

  const text = message.toLowerCase();
  const buyerSignals = [
    "can you reduce",
    "too expensive",
    "my budget",
    "i can offer",
    "best price",
    "lower",
    "discount"
  ];
  const agentSignals = [
    "owner wants",
    "market value",
    "serious buyer",
    "closing fast",
    "can accept",
    "seller",
    "we can do"
  ];

  const buyerScore = buyerSignals.reduce((score, phrase) => score + (text.includes(phrase) ? 1 : 0), 0);
  const agentScore = agentSignals.reduce((score, phrase) => score + (text.includes(phrase) ? 1 : 0), 0);

  return agentScore > buyerScore ? ROLE.AGENT : ROLE.BUYER;
}

function detectIntent({
  role,
  message = "",
  offerPrice,
  askingPrice,
  marketValue,
  timelineDays,
  viewedCount,
  savedCount,
  goal
}) {
  const text = message.toLowerCase();
  const belowAskPct = percentageDiff(askingPrice, offerPrice);
  const belowMarketPct = percentageDiff(marketValue || askingPrice, offerPrice);
  const urgencySignals = ["today", "this week", "urgent", "fast", "immediately", "ready"];
  const investorSignals = ["yield", "roi", "investment", "tenant", "rental", "return"];
  const firmSignals = ["non-negotiable", "firm", "best and final", "final price"];
  const closerSignals = ["close", "deal", "sign", "book", "secure"];

  const urgencyScore =
    urgencySignals.some((token) => text.includes(token)) ||
    (timelineDays != null && timelineDays <= 7) ||
    viewedCount >= 3 ||
    savedCount >= 2;

  const investorScore =
    investorSignals.some((token) => text.includes(token)) ||
    goal === "investment";

  if (role === ROLE.BUYER) {
    if (investorScore) return INTENT.INVESTOR_BUYER;
    if (urgencyScore && belowAskPct > -8) return INTENT.URGENT_BUYER;
    if (belowAskPct <= -10 || belowMarketPct <= -12 || text.includes("too expensive")) {
      return INTENT.PRICE_SENSITIVE_BUYER;
    }
    return INTENT.EXPLORER_BUYER;
  }

  if (firmSignals.some((token) => text.includes(token))) return INTENT.FIRM_AGENT;
  if (closerSignals.some((token) => text.includes(token)) || urgencyScore) return INTENT.CLOSER_AGENT;
  if (text.includes("owner can consider") || text.includes("slightly flexible") || text.includes("can work")) {
    return INTENT.FLEXIBLE_AGENT;
  }
  return INTENT.PASSIVE_AGENT;
}

function calculateNegotiationBand({
  askingPrice,
  marketValue,
  offerPrice,
  minAcceptablePrice,
  pressureLevel = 0.5
}) {
  const fairValue = marketValue || askingPrice;
  const effectiveFloor = minAcceptablePrice || roundToNearest(Math.min(askingPrice * 0.95, fairValue * 0.96));
  const buyerAnchor = roundToNearest(Math.min(offerPrice || fairValue * 0.94, fairValue * 0.955));
  const agentAnchor = roundToNearest(Math.max(askingPrice * 0.985, fairValue * 0.99));
  const midpoint = roundToNearest((effectiveFloor + fairValue) / 2);
  const pressureLift = roundToNearest(fairValue * (0.005 + pressureLevel * 0.012));

  return {
    fairValue: roundToNearest(fairValue),
    buyerAnchor,
    agentAnchor,
    midpoint,
    effectiveFloor,
    pressureLift
  };
}

function suggestCounterOffer({
  role,
  intent,
  askingPrice,
  offerPrice,
  marketValue,
  minAcceptablePrice,
  pressureLevel = 0.5
}) {
  const band = calculateNegotiationBand({
    askingPrice,
    marketValue,
    offerPrice,
    minAcceptablePrice,
    pressureLevel
  });

  let counterOffer = band.midpoint;
  let strategy = "Hold close to fair value and trade small price movement for speed or certainty.";

  if (role === ROLE.BUYER) {
    switch (intent) {
      case INTENT.PRICE_SENSITIVE_BUYER:
        counterOffer = roundToNearest(Math.min(band.buyerAnchor, (offerPrice || band.buyerAnchor) + band.pressureLift * 0.55));
        strategy = "Stay disciplined, move slightly from your anchor, and justify with market value plus nearby transactions.";
        break;
      case INTENT.INVESTOR_BUYER:
        counterOffer = roundToNearest(Math.min(band.midpoint - band.pressureLift * 0.45, band.fairValue * 0.965));
        strategy = "Frame the deal around ROI, yield protection, and your need for margin rather than emotion.";
        break;
      case INTENT.URGENT_BUYER:
        counterOffer = roundToNearest(Math.min(band.midpoint + band.pressureLift * 0.25, band.fairValue * 0.98));
        strategy = "Use speed as leverage: offer a cleaner number in exchange for a fast acceptance.";
        break;
      default:
        counterOffer = roundToNearest(Math.min(band.midpoint, band.fairValue * 0.97));
        strategy = "Keep the move measured and ask for value confirmation before giving away more price.";
        break;
    }
  } else {
    switch (intent) {
      case INTENT.FIRM_AGENT:
        counterOffer = roundToNearest(Math.max(band.agentAnchor, band.effectiveFloor + band.pressureLift * 0.8));
        strategy = "Defend the asking logic, concede very little, and anchor the buyer to the fairness of the asset.";
        break;
      case INTENT.CLOSER_AGENT:
        counterOffer = roundToNearest(Math.max(band.midpoint + band.pressureLift * 0.35, band.effectiveFloor));
        strategy = "Trade a controlled reduction for commitment, booking, or immediate paperwork.";
        break;
      case INTENT.FLEXIBLE_AGENT:
        counterOffer = roundToNearest(Math.max(band.midpoint, band.effectiveFloor));
        strategy = "Show flexibility, but keep the conversation centered on quality and closing confidence.";
        break;
      default:
        counterOffer = roundToNearest(Math.max(band.midpoint + band.pressureLift * 0.18, band.effectiveFloor));
        strategy = "Stay open without losing structure; protect the floor while testing buyer seriousness.";
        break;
    }
  }

  counterOffer = clamp(counterOffer, band.buyerAnchor, Math.max(band.agentAnchor, band.effectiveFloor));

  return {
    counterOffer,
    strategy,
    band
  };
}

function buildPersuasiveReply({
  role,
  intent,
  counterOffer,
  askingPrice,
  marketValue,
  propertyArea,
  tone = TONE.BALANCED
}) {
  const fairValue = marketValue || askingPrice;
  const savings = Math.max(askingPrice - counterOffer, 0);
  const premium = Math.max(counterOffer - fairValue, 0);

  if (role === ROLE.BUYER) {
    const openers = {
      assertive: `I can move at ${money(counterOffer)} if we keep this efficient.`,
      balanced: `I’m prepared to improve to ${money(counterOffer)} with a fair closing path.`,
      warm: `I really like the property and can come up to ${money(counterOffer)} if we can make the numbers work.`
    };

    const intentLine = {
      [INTENT.PRICE_SENSITIVE_BUYER]: `That still respects the market while keeping the deal realistic for me.`,
      [INTENT.INVESTOR_BUYER]: `At that level, the yield and long-term return still make sense for me.`,
      [INTENT.URGENT_BUYER]: `I can move quickly at that number if the seller is ready to proceed.`,
      [INTENT.EXPLORER_BUYER]: `It feels like a fair middle ground based on the current value of the unit.`
    };

    return `${openers[tone] || openers.balanced} ${intentLine[intent] || intentLine[INTENT.EXPLORER_BUYER]} Fair value is around ${money(fairValue)}, so this is a serious offer rather than a lowball.`;
  }

  const openers = {
    assertive: `We can work at ${money(counterOffer)}, but that is already a disciplined move from the current position.`,
    balanced: `I can bring the conversation to ${money(counterOffer)} if we keep the momentum strong.`,
    warm: `I want to help make this happen, and ${money(counterOffer)} is a realistic number to carry forward.`
  };

  const intentLine = {
    [INTENT.FIRM_AGENT]: `That keeps the deal aligned with the asset’s value in ${propertyArea}.`,
    [INTENT.CLOSER_AGENT]: `At this level, we preserve value while making it easier to close quickly.`,
    [INTENT.FLEXIBLE_AGENT]: `It shows genuine flexibility without losing the strength of the listing.`,
    [INTENT.PASSIVE_AGENT]: `It keeps the negotiation constructive and close to fair market value.`
  };

  const valueLine = premium > 0
    ? `It is only ${money(premium)} above estimated fair value, which is reasonable for a strong unit.`
    : `The buyer still saves roughly ${money(savings)} from ask, so the movement is meaningful.`;

  return `${openers[tone] || openers.balanced} ${intentLine[intent] || intentLine[INTENT.PASSIVE_AGENT]} ${valueLine}`;
}

function buildNegotiationResponse(input) {
  const role = inferRole(input.message, input.role);
  const intent = detectIntent({
    role,
    message: input.message,
    offerPrice: input.offerPrice,
    askingPrice: input.askingPrice,
    marketValue: input.marketValue,
    timelineDays: input.timelineDays,
    viewedCount: input.viewedCount || 0,
    savedCount: input.savedCount || 0,
    goal: input.goal
  });

  const { counterOffer, strategy, band } = suggestCounterOffer({
    role,
    intent,
    askingPrice: input.askingPrice,
    offerPrice: input.offerPrice,
    marketValue: input.marketValue,
    minAcceptablePrice: input.minAcceptablePrice,
    pressureLevel: input.pressureLevel
  });

  const persuasiveResponse = buildPersuasiveReply({
    role,
    intent,
    counterOffer,
    askingPrice: input.askingPrice,
    marketValue: input.marketValue,
    propertyArea: input.propertyArea || "the area",
    tone: input.tone || TONE.BALANCED
  });

  return {
    role,
    intent,
    suggestion: {
      counterOffer,
      counterOfferDisplay: money(counterOffer),
      strategy,
      persuasiveResponse
    },
    analysis: {
      askingPrice: money(input.askingPrice),
      marketValue: money(input.marketValue || input.askingPrice),
      currentOffer: input.offerPrice ? money(input.offerPrice) : null,
      gapToAskPct: input.offerPrice ? Number(percentageDiff(input.askingPrice, input.offerPrice).toFixed(1)) : null,
      band: {
        buyerAnchor: money(band.buyerAnchor),
        midpoint: money(band.midpoint),
        effectiveFloor: money(band.effectiveFloor),
        agentAnchor: money(band.agentAnchor)
      }
    }
  };
}

function createNegotiationAssistant(config = {}) {
  return {
    evaluate(input) {
      return buildNegotiationResponse({
        tone: config.defaultTone || TONE.BALANCED,
        pressureLevel: config.defaultPressureLevel ?? 0.5,
        ...input
      });
    },

    detectIntent(input) {
      const role = inferRole(input.message, input.role);
      return {
        role,
        intent: detectIntent({
          role,
          message: input.message,
          offerPrice: input.offerPrice,
          askingPrice: input.askingPrice,
          marketValue: input.marketValue,
          timelineDays: input.timelineDays,
          viewedCount: input.viewedCount || 0,
          savedCount: input.savedCount || 0,
          goal: input.goal
        })
      };
    },

    suggestCounterOffer(input) {
      const role = inferRole(input.message, input.role);
      const intent = detectIntent({
        role,
        message: input.message,
        offerPrice: input.offerPrice,
        askingPrice: input.askingPrice,
        marketValue: input.marketValue,
        timelineDays: input.timelineDays,
        viewedCount: input.viewedCount || 0,
        savedCount: input.savedCount || 0,
        goal: input.goal
      });

      return suggestCounterOffer({
        role,
        intent,
        askingPrice: input.askingPrice,
        offerPrice: input.offerPrice,
        marketValue: input.marketValue,
        minAcceptablePrice: input.minAcceptablePrice,
        pressureLevel: input.pressureLevel ?? config.defaultPressureLevel ?? 0.5
      });
    }
  };
}

const negotiationAssistant = createNegotiationAssistant({
  defaultTone: TONE.BALANCED,
  defaultPressureLevel: 0.55
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ROLE,
    INTENT,
    TONE,
    inferRole,
    detectIntent,
    calculateNegotiationBand,
    suggestCounterOffer,
    buildPersuasiveReply,
    buildNegotiationResponse,
    createNegotiationAssistant,
    negotiationAssistant
  };
}

if (typeof window !== "undefined") {
  window.NegotiationAssistant = {
    ROLE,
    INTENT,
    TONE,
    inferRole,
    detectIntent,
    calculateNegotiationBand,
    suggestCounterOffer,
    buildPersuasiveReply,
    buildNegotiationResponse,
    createNegotiationAssistant,
    negotiationAssistant
  };
}
