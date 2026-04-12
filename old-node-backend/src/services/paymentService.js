/**
 * paymentService.js — Iyzico Ödeme Servis Katmanı (Simülasyon Destekli)
 * * Bu dosya hem gerçek Iyzico API'sini hem de geliştirme aşaması için 
 * Simülasyon Modu'nu destekler.
 */

const Iyzipay = require('iyzipay');

// --- Iyzico İstemci Yapılandırması ---
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || 'sandbox-mock-api-key',
  secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-mock-secret-key',
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
});

/**
 * 3D Secure ödeme başlatma
 */
async function initialize3DSecure({ ticketId, pnr, amount, passenger, card, callbackUrl }) {
  return new Promise((resolve, reject) => {

    // --- SİMÜLASYON MODU KONTROLÜ ---
    // Eğer .env dosyasındaki anahtarlar varsayılan/sahte değerlerse gerçek API'yi atla.
    const isMock = 
      process.env.IYZICO_API_KEY.includes('replace-me') || 
      process.env.IYZICO_API_KEY.includes('mock') ||
      !process.env.IYZICO_API_KEY;

    if (isMock) {
      console.log("⚠️ Simülasyon Modu: Ödeme başarılı sayılıyor...");
      
      const mockHtml = `
        <html>
          <head>
            <title>3D Secure Ödeme Onayı</title>
            <meta charset="utf-8">
            <style>
              body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f4f7f6; }
              .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; }
              .loader { border: 4px solid #f3f3f3; border-top: 4px solid #ff6b35; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body onload="setTimeout(() => document.forms[0].submit(), 2000)">
            <div class="card">
              <h2 style="color: #1a1a2e;">Güvenli Ödeme İşlemi</h2>
              <p style="color: #6c757d;">Bankanızın onay sayfasına yönlendiriliyorsunuz...</p>
              <div class="loader"></div>
              <form action="${callbackUrl}" method="post">
                <input type="hidden" name="status" value="success">
                <input type="hidden" name="paymentId" value="mock-pay-${Date.now()}">
                <input type="hidden" name="conversationId" value="${ticketId}">
              </form>
            </div>
          </body>
        </html>
      `;
      return resolve({ htmlContent: mockHtml });
    }

    // --- GERÇEK IYZICO İSTEĞİ ---
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
      paymentCard: {
        cardHolderName: card.cardHolderName,
        cardNumber: card.cardNumber.replace(/\s/g, ''),
        expireMonth: card.expireMonth,
        expireYear: card.expireYear,
        cvc: card.cvc,
        registerCard: '0',
      },
      buyer: {
        id: passenger.id || 'BYR' + Date.now(),
        name: passenger.firstName,
        surname: passenger.lastName,
        gsmNumber: passenger.phone || '+905000000000',
        email: passenger.email || 'yolcu@example.com',
        identityNumber: passenger.tckn,
        registrationAddress: 'Türkiye',
        ip: '85.34.78.112',
        city: 'Istanbul',
        country: 'Turkey',
      },
      billingAddress: {
        contactName: `${passenger.firstName} ${passenger.lastName}`,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Türkiye',
      },
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
        console.error('❌ Iyzico Hatası:', err);
        return reject(new Error('Servis bağlantı hatası.'));
      }
      if (result.status !== 'success') {
        return resolve({ error: result.errorMessage || 'Ödeme başlatılamadı.' });
      }
      resolve({ htmlContent: result.threeDSHtmlContent });
    });
  });
}

/**
 * 3D Secure ödeme doğrulama
 */
async function confirm3DSecure(paymentId, conversationId) {
  return new Promise((resolve) => {
    
    // Simülasyon kontrolü
    if (paymentId && paymentId.startsWith('mock-pay')) {
      return resolve({
        success: true,
        payment: {
          iyzicoPaymentId: paymentId,
          cardLastFour: '0008',
          cardBrand: 'SimulatedCard',
          paidPrice: '0.00'
        }
      });
    }

    iyzipay.threedsPayment.create(
      {
        locale: Iyzipay.LOCALE.TR,
        conversationId,
        paymentId,
      },
      (err, result) => {
        if (err || result.status !== 'success') {
          return resolve({ success: false, error: result.errorMessage || 'Ödeme doğrulanamadı.' });
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