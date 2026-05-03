(function () {
  const STORAGE_KEY = "kvai_negotiation_threads";

  function read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function write(threads) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  }

  function normalizePhone(phone = "") {
    return phone.replace(/[^\d]/g, "");
  }

  function createBuyerKey(name = "", phone = "") {
    return `${name.trim().toLowerCase()}::${normalizePhone(phone)}`;
  }

  function getAll() {
    return read();
  }

  function getById(id) {
    return read().find((thread) => thread.id === id) || null;
  }

  function getForPropertyBuyer(propertyId, buyerKey) {
    return read()
      .filter((thread) => thread.propertyId === propertyId && thread.buyerKey === buyerKey)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || null;
  }

  function upsertThread(thread) {
    const threads = read();
    const index = threads.findIndex((item) => item.id === thread.id);
    if (index >= 0) threads[index] = thread;
    else threads.unshift(thread);
    write(threads);
    return thread;
  }

  function createThread({
    propertyId,
    propertyTitle,
    propertyArea,
    askingPrice,
    buyerName,
    buyerPhone
  }) {
    const buyerKey = createBuyerKey(buyerName, buyerPhone);
    const existing = getForPropertyBuyer(propertyId, buyerKey);
    if (existing) return existing;

    const now = new Date().toISOString();
    const thread = {
      id: Date.now(),
      propertyId,
      propertyTitle,
      propertyArea,
      askingPrice,
      buyerName,
      buyerPhone,
      buyerKey,
      status: "open",
      createdAt: now,
      updatedAt: now,
      entries: []
    };

    return upsertThread(thread);
  }

  function appendEntry(threadId, entry) {
    const thread = getById(threadId);
    if (!thread) return null;

    const updatedThread = {
      ...thread,
      status: entry.status || thread.status,
      updatedAt: new Date().toISOString(),
      entries: [
        ...thread.entries,
        {
          id: Date.now() + Math.floor(Math.random() * 1000),
          createdAt: new Date().toISOString(),
          ...entry
        }
      ]
    };

    return upsertThread(updatedThread);
  }

  function updateStatus(threadId, status) {
    const thread = getById(threadId);
    if (!thread) return null;
    return upsertThread({
      ...thread,
      status,
      updatedAt: new Date().toISOString()
    });
  }

  window.KVNegotiationStore = {
    getAll,
    getById,
    getForPropertyBuyer,
    createBuyerKey,
    createThread,
    appendEntry,
    updateStatus
  };
})();
