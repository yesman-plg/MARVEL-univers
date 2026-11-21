// Données partagées par toutes les maquettes de la chronologie d'accueil.
// Les textes reprennent la page Histoire actuelle (js/app.js, renderAccueil).
const P = '../images/posters/', C = '../images/characters/';
const TIMELINE = [
  { era: "Aux origines", date: "Avant l'humanité", year: "∞", color: "#b48cff",
    title: "Les Célestes et les Pierres d'Infinité",
    text: "Les Célestes façonnent des mondes et créent les Éternels. Six Pierres d'Infinité naissent avant le Big Bang, et Odin unifie les Neuf Royaumes depuis Asgard.",
    image: P + "eternals.jpeg", thumbs: [C + "thor.jpg", C + "loki.jpg"],
    tags: ["Éternels", "Asgard", "Pierres d'Infinité"] },
  { era: "Antiquité – XIXe s.", date: "1901", year: "1901", color: "#2fa36b",
    title: "Les racines d'Hydra",
    text: "Dans les montagnes d'Autriche, l'organisation occulte Hydra découvre le Tesseract, qui renferme la Pierre de l'Espace.",
    image: P + "captain-america-first-avenger.jpg", thumbs: [C + "johann-schmidt.webp"],
    tags: ["Hydra", "Tesseract"] },
  { era: "Seconde Guerre mondiale", date: "1942 – 1945", year: "1943", color: "#3d7bd9",
    title: "Captain America, premier Avenger",
    text: "Steve Rogers devient super-soldat, affronte Crâne Rouge avec les Howling Commandos puis disparaît dans les glaces de l'Arctique pendant près de 70 ans.",
    image: P + "captain-america-first-avenger.jpg", thumbs: [C + "steve-rogers.jpg", C + "bucky-barnes.jpg"],
    tags: ["Steve Rogers", "Crâne Rouge"] },
  { era: "Guerre froide", date: "1949 – 1995", year: "1995", color: "#e0a526",
    title: "Le S.H.I.E.L.D. et Captain Marvel",
    text: "Peggy Carter et Howard Stark fondent le S.H.I.E.L.D. En 1995, Carol Danvers devient Captain Marvel et un jeune Nick Fury découvre les extraterrestres.",
    image: P + "captain-marvel.jpg", thumbs: [C + "carol-danvers.jpeg", C + "nick-fury.jpg"],
    tags: ["S.H.I.E.L.D.", "Kree", "Skrulls"] },
  { era: "L'émergence des héros", date: "2008 – 2012", year: "2012", color: "#ed1d24",
    title: "La Bataille de New York",
    text: "Iron Man, Hulk, Thor… Nick Fury lance l'Initiative Avengers. Loki ouvre un portail au-dessus de Manhattan : les Avengers sont réunis pour la première fois.",
    image: P + "avengers.jpg", thumbs: [C + "tony-stark.jpg", C + "bruce-banner.jpg", C + "loki.jpg"],
    tags: ["Avengers", "Chitauris", "Pierre de l'Esprit"] },
  { era: "La fracture", date: "2015 – 2016", year: "2016", color: "#8a8f9c",
    title: "Ultron, Sokovie et Civil War",
    text: "Ultron manque d'éteindre l'humanité. Les Accords de Sokovie divisent l'équipe entre Tony Stark et Captain America.",
    image: P + "civil-war.jpg", thumbs: [C + "ultron.webp", C + "vision.jpg", C + "bucky-barnes.jpg"],
    tags: ["Ultron", "Vision", "Accords de Sokovie"] },
  { era: "La Saga de l'Infini", date: "2018 – 2023", year: "2018", color: "#9b3cff",
    title: "Le Snap de Thanos",
    text: "Thanos réunit les six Pierres et efface la moitié de la vie de l'univers. Cinq ans plus tard, les Avengers voyagent dans le temps — Tony Stark se sacrifie.",
    image: P + "endgame.jpg", thumbs: [C + "thanos.jpeg", C + "tony-stark.jpg", C + "steve-rogers.jpg"],
    tags: ["Thanos", "Le Blip", "Endgame"] },
  { era: "La Saga du Multivers", date: "2023 – aujourd'hui", year: "2024", color: "#19c3d6",
    title: "La TVA et l'ouverture du Multivers",
    text: "Un variant de Loki révèle la TVA et Celui qui Demeure. Les branches temporelles se multiplient, des héros d'autres univers croisent le MCU.",
    image: P + "loki-s1.png", thumbs: [C + "loki.jpg", C + "kang.jpeg", C + "peter-parker.jpg"],
    tags: ["TVA", "Variants", "Kang"] },
];

// ---------------------------------------------------------------------------
// Contenu détaillé affiché quand on déploie une carte (detail.js).
// films[].id = id de la fiche dans js/data.js (lien vers #/fiche/<id>).
// ---------------------------------------------------------------------------
const CH = (name, file) => ({ name, img: C + file });
const FI = (id, title, year, file) => ({ id, title, year, poster: P + (file || id + '.jpg') });
const DETAILS = [
  { long: "Avant même la naissance des étoiles, six singularités se condensent en Pierres d'Infinité : l'Espace, l'Esprit, la Réalité, le Pouvoir, le Temps et l'Âme. Les Célestes, géants cosmiques, sèment la vie à travers les galaxies et créent les Éternels pour veiller sur les jeunes civilisations. Bien plus tard, Odin, roi d'Asgard, unifie les Neuf Royaumes et repousse les Géants des Glaces de Jotunheim en 965, ramenant avec lui un enfant abandonné : Loki.",
    facts: [["Pierres d'Infinité", "6"], ["Royaumes", "9"], ["Guerre de Jotunheim", "965"], ["Arrivée des Éternels", "5000 av. J.-C."]],
    chars: [CH("Thor", "thor.jpg"), CH("Loki", "loki.jpg"), CH("Hela", "hela.webp"), CH("Valkyrie", "valkyrie.webp")],
    films: [FI('eternals', 'Eternals', 2021, 'eternals.jpeg'), FI('thor', 'Thor', 2011), FI('thor-ragnarok', 'Thor: Ragnarok', 2017)] },
  { long: "Née dans l'ombre des sociétés secrètes, Hydra prospère en se nourrissant de mythes anciens. Sa quête d'artefacts de pouvoir la mène jusqu'au Tesseract, cube bleu caché sur Terre depuis des siècles par les Asgardiens. Cette découverte donne à Hydra une source d'énergie sans équivalent et prépare l'arsenal qui fera trembler la Seconde Guerre mondiale.",
    facts: [["Organisation", "Hydra"], ["Artefact", "Tesseract"], ["Pierre", "Espace"], ["Devise", "« Coupez une tête… »"]],
    chars: [CH("Johann Schmidt", "johann-schmidt.webp"), CH("Steve Rogers", "steve-rogers.jpg")],
    films: [FI('captain-america-first-avenger', 'Captain America: First Avenger', 2011)] },
  { long: "Recalé à cinq reprises, Steve Rogers est choisi par le Dr Erskine pour le programme Super-Soldat. Devenu Captain America, il libère Bucky Barnes et les prisonniers d'Hydra, forme les Howling Commandos aux côtés de Peggy Carter et traque Crâne Rouge jusqu'au Valkyrie, un bombardier chargé d'armes au Tesseract. Pour sauver New York, il précipite l'appareil dans l'Arctique.",
    facts: [["Sérum", "Dr Abraham Erskine"], ["Unité", "Howling Commandos"], ["Disparition", "1945"], ["Sous la glace", "~70 ans"]],
    chars: [CH("Steve Rogers", "steve-rogers.jpg"), CH("Bucky Barnes", "bucky-barnes.jpg"), CH("Crâne Rouge", "johann-schmidt.webp")],
    films: [FI('captain-america-first-avenger', 'Captain America: First Avenger', 2011), FI('oneshot-agent-carter', 'One-Shot : Agent Carter', 2013)] },
  { long: "Après la guerre, Peggy Carter et Howard Stark fondent le S.H.I.E.L.D., sans savoir qu'Hydra s'y infiltre via l'Opération Paperclip. En 1995, la pilote Carol Danvers, aux pouvoirs nés de l'explosion d'un moteur à vitesse lumière, découvre la vérité sur la guerre Kree-Skrull. Le jeune agent Nick Fury rédige alors un projet qui portera un nom inspiré de Carol : l'Initiative Avengers.",
    facts: [["Fondation du S.H.I.E.L.D.", "1949"], ["Captain Marvel", "1995"], ["Guerre", "Kree / Skrulls"], ["Bipeur de Fury", "1995 → 2018"]],
    chars: [CH("Carol Danvers", "carol-danvers.jpeg"), CH("Nick Fury", "nick-fury.jpg")],
    films: [FI('captain-marvel', 'Captain Marvel', 2019), FI('captain-america-winter-soldier', 'Captain America: Le Soldat de l\'hiver', 2014)] },
  { long: "Capturé en Afghanistan, Tony Stark se construit une armure et devient Iron Man. Bruce Banner fuit l'armée après sa transformation en Hulk, Thor est banni sur Terre et Steve Rogers est retrouvé dans la glace. Quand Loki s'empare du Tesseract et ouvre un portail chitauri au-dessus de Manhattan, Nick Fury réunit enfin son équipe : les Avengers.",
    facts: [["Iron Man", "2010"], ["Bataille de New York", "Mai 2012"], ["Envahisseurs", "Chitauris"], ["Équipe", "6 Avengers"]],
    chars: [CH("Tony Stark", "tony-stark.jpg"), CH("Bruce Banner", "bruce-banner.jpg"), CH("Thor", "thor.jpg"), CH("Natasha Romanoff", "natasha-romanoff.jpg"), CH("Clint Barton", "clint-barton.jpg"), CH("Loki", "loki.jpg")],
    films: [FI('iron-man', 'Iron Man', 2008), FI('incredible-hulk', "L'Incroyable Hulk", 2008), FI('thor', 'Thor', 2011), FI('avengers', 'Avengers', 2012)] },
  { long: "Pour protéger la Terre, Tony Stark et Bruce Banner donnent vie à Ultron, qui conclut que l'humanité doit disparaître. La bataille de Sokovie fait naître Vision mais laisse une ville en ruines. Un an plus tard, les Accords de Sokovie imposent un contrôle de l'ONU : Tony les signe, Steve refuse pour protéger Bucky. L'aéroport de Leipzig scelle la rupture des Avengers.",
    facts: [["Création d'Ultron", "2015"], ["Accords de Sokovie", "2016"], ["Pays signataires", "117"], ["Camp de Steve", "6 héros"]],
    chars: [CH("Ultron", "ultron.webp"), CH("Vision", "vision.jpg"), CH("Wanda Maximoff", "wanda-maximoff.jpg"), CH("Bucky Barnes", "bucky-barnes.jpg"), CH("T'Challa", "tchalla.jpg")],
    films: [FI('avengers-ultron', "Avengers : L'Ère d'Ultron", 2015), FI('civil-war', 'Captain America: Civil War', 2016), FI('black-panther', 'Black Panther', 2018)] },
  { long: "Thanos récupère une à une les Pierres d'Infinité, sacrifiant Gamora sur Vormir. Malgré la résistance au Wakanda, il claque des doigts : la moitié de toute vie disparaît. Cinq ans plus tard, grâce au Royaume Quantique, les Avengers organisent un « casse temporel », ramènent les disparus et affrontent Thanos une dernière fois. Tony Stark utilise le Gant et se sacrifie.",
    facts: [["Le Snap", "2018"], ["Le Blip", "5 ans"], ["Retour des disparus", "2023"], ["Population effacée", "50 %"]],
    chars: [CH("Thanos", "thanos.jpeg"), CH("Gamora", "gamora.jpeg"), CH("Tony Stark", "tony-stark.jpg"), CH("Steve Rogers", "steve-rogers.jpg"), CH("Thor", "thor.jpg"), CH("Nebula", "nebula.png")],
    films: [FI('infinity-war', 'Avengers: Infinity War', 2018), FI('endgame', 'Avengers: Endgame', 2019)] },
  { long: "En s'échappant avec le Tesseract en 2012, un variant de Loki est arrêté par la TVA, qui « élague » toute branche du temps sacré. Il découvre Celui qui Demeure, gardien de la ligne temporelle unique. Sa mort libère le multivers : des Spider-Man d'autres réalités traversent un sort raté de Doctor Strange, Wanda traque d'autres univers, et les variants de Kang se préparent à la guerre.",
    facts: [["TVA", "Autorité de Variance Temporelle"], ["Gardien du temps", "Celui qui Demeure"], ["Menace", "Kang & ses variants"], ["Univers sacré", "Terre-616"]],
    chars: [CH("Loki", "loki.jpg"), CH("Kang", "kang.jpeg"), CH("Peter Parker", "peter-parker.jpg"), CH("Stephen Strange", "stephen-strange.jpeg"), CH("Wanda Maximoff", "wanda-maximoff.jpg")],
    films: [FI('loki-s1', 'Loki (Saison 1)', 2021, 'loki-s1.png'), FI('no-way-home', 'Spider-Man: No Way Home', 2021), FI('doctor-strange-multiverse', 'Doctor Strange in the Multiverse of Madness', 2022), FI('deadpool-wolverine', 'Deadpool & Wolverine', 2024)] },
];
DETAILS.forEach((d, i) => Object.assign(TIMELINE[i], d));
// Lien vers les fiches du site (mis à null dans la version publiée en ligne).
const SITE_FICHE = '../index.html#/fiche/';
