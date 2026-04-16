/**
 * api.js — Backend API İstemci Fonksiyonları
 */

const API_URL = 'https://kadirdemir758-obilet-trip-service.hf.space/api/v1';

async function fetcher(url, options = {}) {
  const res = await fetch(`${API_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Bir hata oluştu.');
  return data;
}

export const tripsApi = {
  /** Sefer arama */
  search: (from, to, date) =>
    fetcher(`/trips?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`),

  /** Tek sefer detayı */
  getById: (id) => fetcher(`/trips/${id}`),
};

export const seatsApi = {
  /** Sefere ait koltukları getir */
  getByTrip: (tripId) => fetcher(`/seats/${tripId}`),
};

export const ticketsApi = {
  /** Koltuk rezervasyonu */
  hold: (data) => fetcher('/tickets/hold', { method: 'POST', body: JSON.stringify(data) }),

  /** PNR ile sorgula */
  getByPnr: (pnr) => fetcher(`/tickets/${pnr}`),
};

export const paymentApi = {
  /** Iyzico ödeme başlat */
  init: (data) => fetcher('/payment/init', { method: 'POST', body: JSON.stringify(data) }),

  /** Ödeme durumunu sorgula */
  getStatus: (id) => fetcher(`/payment/status/${id}`),
};
