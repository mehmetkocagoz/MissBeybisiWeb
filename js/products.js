// MissBeybisi — Product Catalogue
// All prices in Turkish Lira (₺)

function imgSrc(filename) {
  return 'photos/' + filename.replace(/ /g, '%20');
}

const PRODUCTS = [
  {
    id: 1,
    name: "Prenses Dantel Elbise",
    slug: "prenses-dantel-elbise",
    price: 649,
    originalPrice: 849,
    category: "ozel-gun",
    categoryLabel: "Özel Gün",
    ageGroup: "2-4-yas",
    ageLabel: "2–4 Yaş",
    colors: ["Pembe", "Beyaz", "Lila"],
    sizes: ["12-18 Ay", "18-24 Ay", "2 Yaş", "3 Yaş", "4 Yaş"],
    featured: true,
    isNew: true,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.56.jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.56 (1).jpeg"
    ],
    description: "Zarif dantel işlemeli prenses elbisemiz, küçük kızınızın her özel anını unutulmaz kılar. İnce tül katmanları ve el işi dantel detayları ile hazırlanan bu elbise, düğün, nişan ve özel gün törenlerinde mükemmel bir tercih."
  },
  {
    id: 2,
    name: "Tüllü Balo Elbise",
    slug: "tullu-balo-elbise",
    price: 799,
    originalPrice: 999,
    category: "ozel-gun",
    categoryLabel: "Özel Gün",
    ageGroup: "2-4-yas",
    ageLabel: "2–4 Yaş",
    colors: ["Pembe", "Ekru"],
    sizes: ["2 Yaş", "3 Yaş", "4 Yaş", "5 Yaş"],
    featured: true,
    isNew: false,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.56 (2).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.56 (3).jpeg"
    ],
    description: "Kat kat tül etekli balo elbisemiz, masalsı bir görünüm sunar. Üst kısmındaki saten detayları ve arka fiyonkuyla prenses hissi yaratan bu model, doğum günleri ve özel kutlamalar için ideal."
  },
  {
    id: 3,
    name: "Çiçek Nakışlı Elbise",
    slug: "cicek-nakisli-elbise",
    price: 449,
    originalPrice: null,
    category: "gunluk",
    categoryLabel: "Günlük",
    ageGroup: "4-8-yas",
    ageLabel: "4–8 Yaş",
    colors: ["Beyaz", "Pembe"],
    sizes: ["4 Yaş", "5 Yaş", "6 Yaş", "7 Yaş", "8 Yaş"],
    featured: true,
    isNew: true,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.56 (4).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.56 (5).jpeg"
    ],
    description: "Taze çiçek nakışlarıyla süslenmiş günlük elbisemiz, bahar enerjisini her gün hissettirir. Hafif ve nefes alan kumaşıyla okul, piknik ve aile gezileri için mükemmel bir seçim."
  },
  {
    id: 4,
    name: "Fırfırlı Volan Elbise",
    slug: "firfirli-volan-elbise",
    price: 379,
    originalPrice: 479,
    category: "gunluk",
    categoryLabel: "Günlük",
    ageGroup: "0-2-yas",
    ageLabel: "0–2 Yaş",
    colors: ["Pembe", "Lila", "Mint"],
    sizes: ["3-6 Ay", "6-9 Ay", "9-12 Ay", "12-18 Ay", "18-24 Ay"],
    featured: false,
    isNew: false,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.56 (6).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.56 (7).jpeg"
    ],
    description: "Sevimli volan fırfırlarıyla bebeğinizi pamuk gibi saran bu elbise, gün boyu konfor sunar. Yumuşak pamuklu iç astarı ile hassas bebek tenine zarar vermez."
  },
  {
    id: 5,
    name: "Payetli Abiye Elbise",
    slug: "payetli-abiye-elbise",
    price: 1099,
    originalPrice: 1399,
    category: "ozel-gun",
    categoryLabel: "Özel Gün",
    ageGroup: "4-8-yas",
    ageLabel: "4–8 Yaş",
    colors: ["Altın", "Gümüş", "Pembe"],
    sizes: ["4 Yaş", "5 Yaş", "6 Yaş", "7 Yaş", "8 Yaş"],
    featured: true,
    isNew: false,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.56 (8).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.56 (9).jpeg"
    ],
    description: "Işıltılı payetleriyle her ortamda göz kamaştıran abiye elbisemiz, mezuniyet törenleri, nikah ve özel davetler için tasarlandı. Çift astarlı yapısıyla hem şık hem konforlu."
  },
  {
    id: 6,
    name: "Kolsuz Yazlık Elbise",
    slug: "kolsuz-yazlik-elbise",
    price: 299,
    originalPrice: null,
    category: "gunluk",
    categoryLabel: "Günlük",
    ageGroup: "2-4-yas",
    ageLabel: "2–4 Yaş",
    colors: ["Sarı", "Pembe", "Mavi"],
    sizes: ["18-24 Ay", "2 Yaş", "3 Yaş", "4 Yaş"],
    featured: false,
    isNew: true,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.56 (10).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.56 (11).jpeg"
    ],
    description: "Serin yazlık kumaşıyla hazırlanan kolsuz elbisemiz, sıcak yaz günlerinde minik kızınızı ferah tutar. Pratik çıtçıt kapamalarıyla giyim kolaylığı sağlar."
  },
  {
    id: 7,
    name: "Balonlu Kollu Elbise",
    slug: "balonlu-kollu-elbise",
    price: 529,
    originalPrice: 649,
    category: "ozel-gun",
    categoryLabel: "Özel Gün",
    ageGroup: "0-2-yas",
    ageLabel: "0–2 Yaş",
    colors: ["Pembe", "Ekru"],
    sizes: ["3-6 Ay", "6-9 Ay", "9-12 Ay", "12-18 Ay"],
    featured: false,
    isNew: false,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.56 (12).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.57.jpeg"
    ],
    description: "Şişirilmiş balon kolları ve kabartmalı etek tasarımıyla masalsı bir görünüm sunan elbisemiz, bebek törenlerinde ve vaftiz merasimlerinde tercih edilen klasik bir model."
  },
  {
    id: 8,
    name: "Jakarlı Özel Gün Elbise",
    slug: "jakarli-ozel-gun-elbise",
    price: 749,
    originalPrice: 949,
    category: "ozel-gun",
    categoryLabel: "Özel Gün",
    ageGroup: "4-8-yas",
    ageLabel: "4–8 Yaş",
    colors: ["Kırmızı", "Lacivert", "Pembe"],
    sizes: ["4 Yaş", "5 Yaş", "6 Yaş", "7 Yaş", "8 Yaş"],
    featured: false,
    isNew: true,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.57 (1).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.57 (2).jpeg"
    ],
    description: "Jakarlı dokuma kumaşından üretilen bu özel gün elbisesi, şık ve zarif duruşuyla kız çocuğunuzu yıldız yapacak. Arkadan düğmeli tasarımı ile giyip çıkarmak çok kolay."
  },
  {
    id: 9,
    name: "Fiyonklu Midi Elbise",
    slug: "fiyonklu-midi-elbise",
    price: 419,
    originalPrice: null,
    category: "gunluk",
    categoryLabel: "Günlük",
    ageGroup: "2-4-yas",
    ageLabel: "2–4 Yaş",
    colors: ["Pembe", "Lila", "Beyaz"],
    sizes: ["2 Yaş", "3 Yaş", "4 Yaş"],
    featured: false,
    isNew: false,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.57 (3).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.57 (4).jpeg"
    ],
    description: "Büyük fiyonk detaylı midi elbisemiz, hem şık hem de rahat bir görünüm sunar. Diz altı uzunluğu ve yumuşak kumaşıyla günlük kullanım için ideal bir seçim."
  },
  {
    id: 10,
    name: "Kısa Kollu Prenses Elbise",
    slug: "kisa-kollu-prenses-elbise",
    price: 479,
    originalPrice: 599,
    category: "ozel-gun",
    categoryLabel: "Özel Gün",
    ageGroup: "0-2-yas",
    ageLabel: "0–2 Yaş",
    colors: ["Pembe", "Lila"],
    sizes: ["6-9 Ay", "9-12 Ay", "12-18 Ay", "18-24 Ay"],
    featured: true,
    isNew: false,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.57 (5).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.57 (6).jpeg"
    ],
    description: "Tatlı kısa kolları ve bol tül eteğiyle bebeğinizi masalların prensesine dönüştüren bu elbise, ilk doğum günü ve özel anlar için tasarlandı. Yumuşak iç astarı hassas bebek tenine uygun."
  },
  {
    id: 11,
    name: "Dantelli Omuz Elbise",
    slug: "dantelli-omuz-elbise",
    price: 549,
    originalPrice: null,
    category: "ozel-gun",
    categoryLabel: "Özel Gün",
    ageGroup: "4-8-yas",
    ageLabel: "4–8 Yaş",
    colors: ["Beyaz", "Pembe"],
    sizes: ["4 Yaş", "5 Yaş", "6 Yaş", "7 Yaş", "8 Yaş"],
    featured: false,
    isNew: true,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.57 (7).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.57 (8).jpeg"
    ],
    description: "Omuz bölgesindeki ince dantel detaylarıyla şıklık ve zarafeti bir arada sunan bu elbise, bayram sabahlarını ve aile toplantılarını özel kılar. A-line kesimi her vücut tipine uyum sağlar."
  },
  {
    id: 12,
    name: "Tütü Doğum Günü Elbise",
    slug: "tutu-dogum-gunu-elbise",
    price: 699,
    originalPrice: 899,
    category: "ozel-gun",
    categoryLabel: "Özel Gün",
    ageGroup: "0-2-yas",
    ageLabel: "0–2 Yaş",
    colors: ["Pembe", "Altın", "Beyaz"],
    sizes: ["3-6 Ay", "6-9 Ay", "9-12 Ay", "12-18 Ay"],
    featured: true,
    isNew: false,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.57 (9).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.57 (10).jpeg"
    ],
    description: "İlk doğum günü törenlerinin vazgeçilmezi olan tütü elbisemiz, bol tül katmanları ve taçlı fotoğraf çekimi için biçilmiş kaftan sunuyor. Sevimli ve şık bir doğum günü anısı için mükemmel."
  },
  {
    id: 13,
    name: "Saten Gece Elbise",
    slug: "saten-gece-elbise",
    price: 899,
    originalPrice: 1199,
    category: "ozel-gun",
    categoryLabel: "Özel Gün",
    ageGroup: "4-8-yas",
    ageLabel: "4–8 Yaş",
    colors: ["Pembe", "Ekru", "Gümüş"],
    sizes: ["4 Yaş", "5 Yaş", "6 Yaş", "7 Yaş", "8 Yaş"],
    featured: false,
    isNew: false,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.58.jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.58 (1).jpeg"
    ],
    description: "Parlak saten kumaşından üretilen gece elbisemiz, akşam davetleri ve kutlamalar için ideal. Uzun etek ve gösterişli silüetiyle küçük kızınızı yıldıza dönüştürecek."
  },
  {
    id: 14,
    name: "Romantic Tül Elbise",
    slug: "romantic-tul-elbise",
    price: 589,
    originalPrice: null,
    category: "ozel-gun",
    categoryLabel: "Özel Gün",
    ageGroup: "2-4-yas",
    ageLabel: "2–4 Yaş",
    colors: ["Pembe", "Lila", "Beyaz"],
    sizes: ["2 Yaş", "3 Yaş", "4 Yaş"],
    featured: false,
    isNew: true,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.58 (2).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.58 (3).jpeg"
    ],
    description: "Romantik tül katmanları ve ince fiyonk kemeriyle çerçevelenen bu elbise, her küçük kızın hayalini süsleyen bir prenses kıyafeti. Düğün ve kutlama törenlerinde dikkat çekici bir görünüm."
  },
  {
    id: 15,
    name: "Nakışlı Uzun Elbise",
    slug: "nakisli-uzun-elbise",
    price: 669,
    originalPrice: 849,
    category: "ozel-gun",
    categoryLabel: "Özel Gün",
    ageGroup: "4-8-yas",
    ageLabel: "4–8 Yaş",
    colors: ["Beyaz", "Pembe"],
    sizes: ["4 Yaş", "5 Yaş", "6 Yaş", "7 Yaş", "8 Yaş"],
    featured: false,
    isNew: false,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.58 (4).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.58 (5).jpeg"
    ],
    description: "El nakışıyla işlenmiş çiçek motifleri ve uzun kesimi ile abiye zarafetini günlük şıklıkla birleştiren bu elbise, okul piyangosu ve sünnet törenlerinde de tercih ediliyor."
  },
  {
    id: 16,
    name: "Vintage Dantel Elbise",
    slug: "vintage-dantel-elbise",
    price: 729,
    originalPrice: 929,
    category: "ozel-gun",
    categoryLabel: "Özel Gün",
    ageGroup: "2-4-yas",
    ageLabel: "2–4 Yaş",
    colors: ["Ekru", "Pembe"],
    sizes: ["18-24 Ay", "2 Yaş", "3 Yaş", "4 Yaş"],
    featured: true,
    isNew: false,
    images: [
      "WhatsApp Image 2026-06-14 at 22.31.58 (6).jpeg",
      "WhatsApp Image 2026-06-14 at 22.31.58 (7).jpeg"
    ],
    description: "Vintage estetiğini modern kesimle buluşturan dantel elbisemiz, nostalji ve zarafeti bir arada sunar. Krem rengi dantel detayları ve uzun kollarıyla hem şık hem de sıcak."
  }
];

function getProductBySlug(slug) {
  return PRODUCTS.find(p => p.slug === slug) || null;
}

function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

function getFeaturedProducts() {
  return PRODUCTS.filter(p => p.featured);
}

function getNewProducts() {
  return PRODUCTS.filter(p => p.isNew);
}

function getRelatedProducts(product, count = 4) {
  return PRODUCTS
    .filter(p => p.id !== product.id && (p.category === product.category || p.ageGroup === product.ageGroup))
    .slice(0, count);
}

function filterProducts({ category, ageGroup, minPrice, maxPrice, search, sortBy } = {}) {
  let results = [...PRODUCTS];

  if (category && category !== 'all') {
    results = results.filter(p => p.category === category);
  }
  if (ageGroup && ageGroup !== 'all') {
    results = results.filter(p => p.ageGroup === ageGroup);
  }
  if (minPrice != null) {
    results = results.filter(p => p.price >= minPrice);
  }
  if (maxPrice != null) {
    results = results.filter(p => p.price <= maxPrice);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  switch (sortBy) {
    case 'price-asc':  results.sort((a, b) => a.price - b.price); break;
    case 'price-desc': results.sort((a, b) => b.price - a.price); break;
    case 'newest':     results.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    case 'discount':
      results.sort((a, b) => {
        const da = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const db = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return db - da;
      });
      break;
    default: break;
  }

  return results;
}
