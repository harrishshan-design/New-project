const Lead = require("../models/Lead");
const { scoreLead } = require("../services/aiService");
const { sendDealAlert } = require("../services/whatsappService");

async function getLeads(_req, res) {
  try {
    const leads = await Lead.find().sort({ score: -1 });
    res.json({ success: true, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function postLead(req, res) {
  try {
    const lead = new Lead(req.body);
    lead.score = await scoreLead(lead);
    await lead.save();
    
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function postLeadCapture(req, res) {
  try {
    const lead = new Lead(req.body);
    lead.score = await scoreLead(lead);
    await lead.save();

    // Trigger WhatsApp notification to the lead immediately upon capture if phone is provided
    if (lead.phone) {
      // Mock passing a random property or something. 
      // In a real flow, the property info would be part of req.body.
      await sendDealAlert(lead, { title: lead.propertyTitle || "an exclusive property", price: "TBD" });
    }

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function postLeadEvent(req, res) {
  try {
    const lead = await Lead.findById(req.body.leadId);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    // Update lead logic here
    Object.assign(lead, req.body.eventData || {});
    lead.score = await scoreLead(lead); // re-score based on event
    
    if (lead.score > 80) lead.hotLead = true;
    
    await lead.save();
    res.status(200).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function getHotLeads(_req, res) {
  try {
    const hotLeads = await Lead.find({ hotLead: true }).sort({ score: -1 });
    res.json({ success: true, data: hotLeads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getLeadDistribution(_req, res) {
  // Mock logic
  res.json({ success: true, data: { hot: 10, warm: 20, cold: 30 } });
}

async function getCRMOverview(_req, res) {
  // Mock logic
  res.json({ success: true, data: { totalLeads: 60, conversions: 5 } });
}

module.exports = {
  getLeads,
  postLead,
  postLeadCapture,
  postLeadEvent,
  getHotLeads,
  getLeadDistribution,
  getCRMOverview,
};
