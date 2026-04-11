/**
 * tcknValidator.js — TCKN Doğrulama Algoritması
 *
 * Türk Cumhuriyeti Kimlik Numarası (TCKN) 11 haneli olup
 * belirli matematiksel kuralları sağlamak zorundadır.
 *
 * Algoritma Adımları:
 * 1. 11 haneli ve sadece rakamlardan oluşmalı
 * 2. İlk hane 0 olamaz
 * 3. Tüm rakamlar aynı olamaz (11111111111 geçersiz)
 * 4. Tek rakamlar toplamı × 7 - Çift rakamlar toplamı ≡ d10 (mod 10)
 * 5. İlk 10 rakamın toplamı ≡ d11 (mod 10)
 */

/**
 * TCKN doğrulama fonksiyonu
 * @param {string} tckn - Doğrulanacak TCKN
 * @returns {{ valid: boolean, message: string }}
 */
export function validateTCKN(tckn) {
  // ─── Adım 1: Format Kontrolü ──────────────────────────
  if (!tckn || typeof tckn !== 'string') {
    return { valid: false, message: 'TCKN giriniz.' };
  }

  const cleaned = tckn.trim();

  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, message: 'TCKN yalnızca rakamlardan oluşmalıdır.' };
  }

  if (cleaned.length !== 11) {
    return { valid: false, message: `TCKN 11 haneli olmalıdır. (Girilen: ${cleaned.length} hane)` };
  }

  // ─── Adım 2: İlk Hane Kontrolü ───────────────────────
  if (cleaned[0] === '0') {
    return { valid: false, message: 'TCKN\'nin ilk hanesi 0 olamaz.' };
  }

  // ─── Adım 3: Tüm Aynı Rakam Kontrolü ─────────────────
  if (/^(.)\1{10}$/.test(cleaned)) {
    return { valid: false, message: 'Geçersiz TCKN formatı.' };
  }

  // Rakamları diziye çevir (0-indexed)
  const d = cleaned.split('').map(Number);

  // ─── Adım 4: 10. Hane Kontrol Algoritması ────────────
  // (d[0]+d[2]+d[4]+d[6]+d[8]) * 7 - (d[1]+d[3]+d[5]+d[7]) mod 10 = d[9]
  const oddSum  = d[0] + d[2] + d[4] + d[6] + d[8]; // 1,3,5,7,9. rakamlar
  const evenSum = d[1] + d[3] + d[5] + d[7];          // 2,4,6,8. rakamlar
  const check10 = ((oddSum * 7) - evenSum) % 10;

  if (check10 !== d[9]) {
    return { valid: false, message: 'Geçersiz TCKN numarası.' };
  }

  // ─── Adım 5: 11. Hane Kontrol Algoritması ────────────
  // (d[0]+d[1]+...+d[9]) mod 10 = d[10]
  const sumFirst10 = d.slice(0, 10).reduce((acc, n) => acc + n, 0);
  const check11 = sumFirst10 % 10;

  if (check11 !== d[10]) {
    return { valid: false, message: 'Geçersiz TCKN numarası.' };
  }

  return { valid: true, message: 'TCKN geçerli ✓' };
}

/**
 * TCKN girişini formatlar (sade sayı olarak tutar)
 * @param {string} value
 * @returns {string}
 */
export function formatTCKN(value) {
  return value.replace(/\D/g, '').slice(0, 11);
}

/**
 * Test amaçlı geçerli bir TCKN örneği
 * NOT: Gerçek bir vatandaşın numarası değildir, matematiksel olarak geçerlidir.
 */
export const SAMPLE_VALID_TCKN = '10000000146';
