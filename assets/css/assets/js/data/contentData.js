export const CONTENT = {
  version: "1.0.0",
  channelRotation: ["tiktok", "instagram", "shorts", "facebook"],

  brandTags: ["#josephcreatorlab", "#creatorlab", "#josephcreator", "#brandjoseph", "#personalbrand"],

  formatTagsByChannel: {
    tiktok: ["#tiktokitalia", "#tiktokbusiness", "#viralitalia", "#shortvideo"],
    instagram: ["#reelsitalia", "#reelsmarketing", "#algoritmoinstagram", "#shortvideo"],
    shorts: ["#youtubeshorts", "#shortsitalia", "#videocontent", "#shortvideo"],
    facebook: ["#facebookbusiness", "#socialitalia", "#onlineitalia", "#videocontent"]
  },

  tagPools: {
    realestate_core: [
      "#immobiliare", "#mercatoimmobiliare", "#immobiliareitalia", "#realestateitalia",
      "#venderecasa", "#comprarecasa", "#caseinvendita", "#agenziaimmobiliare",
      "#marketingimmobiliare", "#valutazioneimmobiliare", "#offmarket"
    ],
    realestate_price: ["#valutazioneimmobiliare", "#mercatoimmobiliare", "#venderecasa", "#realestateitalia"],
    realestate_marketing: ["#marketingimmobiliare", "#immobiliaredigitale", "#propertymarketing", "#realestatemarketing"],
    realestate_negotiation: ["#venderecasa", "#mercatoimmobiliare", "#realestatebusiness", "#immobiliareprofessionale"],
    realestate_legal: ["#venderecasa", "#immobiliareitalia", "#classeenergetica", "#planimetria"],
    realestate_investors: ["#investimentiimmobiliari", "#realestatebusiness", "#mercatoimmobiliare"]
  },

  routingRules: [
    { category: "realestate_price", keywords: ["quanto vale", "prezzo", "valore", "valutazione", "sconto", "abbassare", "partire alto"] },
    { category: "realestate_marketing", keywords: ["foto", "video", "annuncio", "open house", "home staging", "presentazione", "marketing"] },
    { category: "realestate_negotiation", keywords: ["offerta", "trattare", "offerte basse", "caparra", "compromesso", "cash buyer", "contanti"] },
    { category: "realestate_legal", keywords: ["documenti", "rogito", "mutuo", "planimetria", "classe energetica", "catasto"] },
    { category: "realestate_investors", keywords: ["investitori", "investimenti", "off-market", "off market"] }
  ],

  qaPairs: [
    { id: 1, q: "Quanto vale davvero casa mia oggi?", a: "Vale quanto il mercato è disposto a pagare oggi per immobili simili già venduti nella stessa zona." },
    { id: 2, q: "Perché la mia casa non si vende?", a: "Perché prezzo, presentazione o strategia non sono allineati al mercato." },
    { id: 3, q: "Sto sbagliando il prezzo di vendita?", a: "Se non arrivano visite qualificate o offerte, il prezzo non è corretto." },
    { id: 4, q: "Conviene vendere casa adesso?", a: "Conviene vendere quando prezzo e strategia sono giusti, non aspettando il momento perfetto." },
    { id: 5, q: "Posso vendere casa senza agenzia?", a: "Si può fare, ma spesso si perde tempo e si vende a meno." }
  ]
};
