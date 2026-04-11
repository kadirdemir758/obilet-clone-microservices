/**
 * seatService.js — Koltuk İş Mantığı Servisi
 *
 * Türkiye otobüs kuralları:
 * - Yabancı erkek ve kadın yan yana oturamaz
 * - 2+1 düzende: Sol taraf 2'li, sağ taraf 1'li
 * - 2+2 düzende: Her iki taraf 2'şer koltuk
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Verilen koltuk numarasının yanındaki koltuğu döner.
 * @param {number} seatNumber - Koltuk numarası
 * @param {string} layout - 'LAYOUT_2_1' | 'LAYOUT_2_2'
 * @returns {number|null} - Yan koltuk numarası veya null (yanı yok)
 */
function getAdjacentSeat(seatNumber, layout) {
  if (layout === 'LAYOUT_2_1') {
    // 2+1 düzen: Her satırda 3 koltuk (1, 2 | 3)
    // Koltuk 1-2 yan yana, koltuk 3 tek
    const row = Math.ceil(seatNumber / 3);
    const posInRow = seatNumber - (row - 1) * 3; // 1, 2 veya 3

    if (posInRow === 1) return seatNumber + 1; // Sol çift grubun ilki
    if (posInRow === 2) return seatNumber - 1; // Sol çift grubun ikincisi
    return null; // 3. koltuk — tek taraf, yanı yok
  }

  if (layout === 'LAYOUT_2_2') {
    // 2+2 düzen: Her satırda 4 koltuk (1,2 | 3,4)
    const row = Math.ceil(seatNumber / 4);
    const posInRow = seatNumber - (row - 1) * 4; // 1, 2, 3 veya 4

    if (posInRow === 1) return seatNumber + 1;
    if (posInRow === 2) return seatNumber - 1;
    if (posInRow === 3) return seatNumber + 1;
    if (posInRow === 4) return seatNumber - 1;
  }

  return null;
}

/**
 * Koltuk seçiminin cinsiyet kuralına uygunluğunu kontrol eder.
 *
 * Kural: Boş bir koltuk seçildiğinde, yanındaki koltuk doluysa
 * ve farklı cinsiyetteyse seçim reddedilir.
 *
 * @param {string} tripId
 * @param {number} seatNumber
 * @param {string} passengerGender - 'MALE' | 'FEMALE'
 * @returns {{ allowed: boolean, reason?: string }}
 */
async function checkGenderRule(tripId, seatNumber, passengerGender) {
  // Seferin otobüs düzenini al
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { bus: true },
  });

  if (!trip) return { allowed: false, reason: 'Sefer bulunamadı.' };

  const layout = trip.bus.seatLayout;
  const adjacentSeatNumber = getAdjacentSeat(seatNumber, layout);

  // Yan koltuk yoksa (tek koltuk) — kural uygulanmaz
  if (adjacentSeatNumber === null) {
    return { allowed: true };
  }

  // Yan koltuğun durumunu sorgula
  const adjacentSeat = await prisma.seat.findFirst({
    where: { tripId, seatNumber: adjacentSeatNumber },
  });

  if (!adjacentSeat || adjacentSeat.status === 'EMPTY') {
    // Yan koltuk boş — sorun yok
    return { allowed: true };
  }

  // Yan koltuk doluysa cinsiyet kontrolü yap
  if (adjacentSeat.gender && adjacentSeat.gender !== passengerGender) {
    const adjacentGenderTR = adjacentSeat.gender === 'MALE' ? 'Erkek' : 'Kadın';
    const passengerGenderTR = passengerGender === 'MALE' ? 'erkek' : 'kadın';
    return {
      allowed: false,
      reason: `Bu koltuk, yan koltuktaki ${adjacentGenderTR} yolcuyla aynı cinsiyetten olmayan bir ${passengerGenderTR} yolcu tarafından alınamaz. Lütfen farklı bir koltuk seçin.`,
    };
  }

  return { allowed: true };
}

module.exports = { checkGenderRule, getAdjacentSeat };
