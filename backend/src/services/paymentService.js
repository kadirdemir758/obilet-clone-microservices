/**
 * paymentService.js — Iyzico Ödeme Servis Katmanı
 *
 * Iyzico 3D Secure ödeme akışı:
 * 1. initialize3DSecure() → Iyzico'ya istek gönderir, HTML form döner
 * 2. confirm3DSecure()    → Iyzico callback'ini doğrular ve ödemeyi tamamlar
 *
 * Sandbox test kartı:
 * Kart No: 5528790000000008
 * SKT:     12/30
 * CVV:     123
 * 3D Şifre: a (Garanti Bankası sandbox)
 */

const Iyzipay = require('iyzipay');

// ─── Iyzico İstemci Yapılandırması ───────────────────
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || 'sandbox-mock-api-key',
  secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-mock-secret-key',
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
});

/**
 * 3D Secure ödeme başlatma
 *
 * @param {Object} params
 * @param {string} params.ticketId       - Bilet ID
 * @param {string} params.pnr            - Bilet PNR numarası
 * @param {number} params.amount         - Ödeme tutarı (TL)
 * @param {Object} params.passenger      - Yolcu bilgileri
 * @param {Object} params.card           - Kart bilgileri
 * @param {string} params.callbackUrl    - 3D sonrası yönlenecek URL
 * @returns {Promise<{ htmlContent?: string, error?: string }>}
 */
async function initialize3DSecure({ ticketId, pnr, amount, passenger, card, callbackUrl }) {
  return new Promise((resolve, reject) => {
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `${ticketId}-${Date.now()}`,
      price: amount.toString(),
      paidPrice: amount.toString(),
      currency: Iyzipay.CURRENCY.TRY,
      installment: '1',
      basketId: pnr,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl,

      // ─── Kart Bilgileri ─────────────────────────────
      paymentCard: {
        cardHolderName: card.cardHolderName,
        cardNumber: card.cardNumber.replace(/\s/g, ''),
        expireMonth: card.expireMonth,
        expireYear: card.expireYear,
        cvc: card.cvc,
        registerCard: '0',
      },

      // ─── Alıcı Bilgileri ────────────────────────────
      buyer: {
        id: passenger.id,
        name: passenger.firstName,
        surname: passenger.lastName,
        gsmNumber: passenger.phone || '+905000000000',
        email: passenger.email || 'yolcu@obilet.com',
        identityNumber: passenger.tckn,
        registrationAddress: 'Türkiye',
        ip: '85.34.78.112', // Gerçek uygulamada req.ip kullanın
        city: 'Istanbul',
        country: 'Turkey',
      },

      // ─── Fatura Adresi ──────────────────────────────
      billingAddress: {
        contactName: `${passenger.firstName} ${passenger.lastName}`,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Türkiye',
      },

      // ─── Sepet Ürünü (Bilet) ────────────────────────
      basketItems: [
        {
          id: ticketId,
          name: `Otobüs Bileti — ${pnr}`,
          category1: 'Ulaşım',
          category2: 'Otobüs',
          itemType: Iyzipay.BASKET_ITEM_TYPE.NON_VIRTUAL,
          price: amount.toString(),
        },
      ],
    };

    iyzipay.threedsInitialize.create(request, (err, result) => {
      if (err) {
        console.error('❌ Iyzico başlatma hatası:', err);
        return reject(new Error('Ödeme servisi şu anda kullanılamıyor.'));
      }

      if (result.status !== 'success') {
        console.error('❌ Iyzico başlatma başarısız:', result.errorMessage);
        return resolve({
          error: result.errorMessage || 'Ödeme başlatılamadı.',
          errorCode: result.errorCode,
        });
      }

      resolve({ htmlContent: result.threeDSHtmlContent });
    });
  });
}

/**
 * 3D Secure ödeme doğrulama ve tamamlama
 *
 * @param {string} paymentId      - Iyzico'nun döndürdüğü paymentId
 * @param {string} conversationId - Başlatmada gönderilen conversationId
 * @returns {Promise<{ success: boolean, payment?: Object, error?: string }>}
 */
async function confirm3DSecure(paymentId, conversationId) {
  return new Promise((resolve, reject) => {
    iyzipay.threedsPayment.create(
      {
        locale: Iyzipay.LOCALE.TR,
        conversationId,
        paymentId,
      },
      (err, result) => {
        if (err) {
          console.error('❌ Iyzico doğrulama hatası:', err);
          return reject(new Error('Ödeme doğrulaması başarısız.'));
        }

        if (result.status !== 'success') {
          return resolve({
            success: false,
            error: result.errorMessage || 'Ödeme doğrulanamadı.',
          });
        }

        resolve({
          success: true,
          payment: {
            iyzicoPaymentId: result.paymentId,
            iyzicoToken: result.token,
            cardLastFour: result.cardLastFourDigits,
            cardBrand: result.cardBrand,
            paidPrice: result.paidPrice,
          },
        });
      }
    );
  });
}

module.exports = { initialize3DSecure, confirm3DSecure };
