/* ============================================================
   STILL WATERS — the prayers everyone starts with
   ------------------------------------------------------------
   Fourteen entries: the Rosary and the Three Hail Marys (which have
   their own tabs), and twelve prayers to recite. Each visitor can
   remove any of these from their own list and add prayers of their
   own; that never changes this file.

   To change a built-in prayer for everyone, edit it here.
   Don't change an "id" once people have used the site: the calendar
   remembers prayers by id.
============================================================ */

export const CLOSING = 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.';

// Every one of the twelve prayers closes with the same three prayers, each for its own intention.
const conclude = (ourFather, hailMarys, gloryBe) => [
  { count: 1, name: 'Our Father', key: 'ourFather', intention: ourFather },
  { count: 3, name: 'Hail Marys', key: 'hailMary', intention: hailMarys },
  { count: 1, name: 'Glory Be', key: 'gloryBe', intention: gloryBe },
];

export const BUILTIN = [
  /* ---------- the two devotions with their own guides ---------- */
  {
    id: 'rosary',
    kind: 'guide',
    nav: 'rosary',
    title: 'The Holy Rosary',
    short: 'The Holy Rosary',
    summary: 'Twenty-one steps around a circle of beads: a walk through the life of Jesus with His Mother beside you. The guide takes you bead by bead, with the Mysteries for today.',
    linkText: 'Open the Rosary guide',
  },
  {
    id: 'three-hail-marys',
    kind: 'guide',
    nav: 'hailmarys',
    title: 'The Three Hail Marys',
    short: 'The Three Hail Marys',
    summary: 'Morning and evening, three Hail Marys honoring Our Lady’s Power, Wisdom, and Mercy, with the daily novena prayers.',
    linkText: 'Open the Three Hail Marys',
  },

  /* ---------- twelve prayers to recite ---------- */
  {
    id: 'joyful-labor',
    title: 'A Prayer for Joyful Labor and Focused Study',
    short: 'Joyful Labor and Focused Study',
    address: 'Heavenly Father, Creator of all things,',
    body: [
      'I come before You today with a heart full of gratitude. Thank You for the gift of this day, for the breath in my lungs, and for the quiet blessings that so often go unnoticed. Thank You for the intellect You have given me, the resources to learn, and the path of preparation You are laying out for my future.',
      'Lord, as I sit down to my work and studies, I ask for the guidance of the Holy Spirit. Clear my mind of distractions and grant me the discipline to remain focused on the tasks before me. Help me to see this daily effort not as a heavy burden, but as a joyful vocation. When the material is difficult, give me perseverance; when the hours feel tedious, give me patience.',
      'Fill my heart with a quiet happiness that comes from knowing I am actively using the talents You have entrusted to me. Guide my rhythms of deep focus and my moments of rest, so that neither my mind nor my spirit grows weary.',
      'I offer all my efforts, my reading, my problem-solving, and my breaks to You today. May my honest labor be a continuous prayer, and may the foundation I build serve Your greater glory.',
    ],
    concludeLead: 'Conclude your personal reflection by praying:',
    conclude: conclude(
      'for the grace to do His will in your work today',
      'for focus, peace of mind, and the guidance of our Blessed Mother',
      'in thanksgiving for the day’s blessings',
    ),
    saints: [
      'St. Thomas Aquinas, patron of students, pray for me.',
      'St. Joseph the Worker, pray for me.',
    ],
  },
  {
    id: 'before-exam',
    title: 'A Prayer for Clarity and Peace Before an Exam or Challenge',
    short: 'Clarity and Peace Before an Exam',
    address: 'Lord God,',
    body: [
      'I come to you now as I prepare to face this upcoming challenge. You know the weight of my responsibilities, the nerves in my heart, and the desire I have to do well.',
      'I offer up to You all the hours of preparation, the studying, and the effort I have poured into this moment. Please bless the work I have done. As I step into this room, I ask You to send the Holy Spirit to calm my anxieties. Grant me clarity of mind, steady nerves, and a peaceful spirit.',
      'Help me to readily recall what I have learned, to articulate my thoughts clearly, and to perform to the very best of the abilities You have given me. Protect me from careless mistakes and the distraction of self-doubt.',
      'Above all, Lord, remind me that my ultimate worth is not defined by scores, outcomes, or the validation of others, but by my identity as Your beloved child. I surrender the results of this effort to Your will, trusting that You are guiding my steps and preparing my future.',
    ],
    concludeLead: 'Conclude your preparation by praying:',
    conclude: conclude(
      'for trust in His plan, whatever the outcome',
      'for grace under pressure, mental clarity, and a calm heart',
      'giving the glory of your efforts back to God',
    ),
    saints: [
      'St. Joseph of Cupertino, patron of students facing tests, pray for me.',
      'St. Gabriel the Archangel, patron of messengers and communicators, pray for me.',
    ],
  },
  {
    id: 'health',
    title: 'A Prayer for Daily Health, Strength, and Well-Being',
    short: 'Daily Health and Strength',
    address: 'Lord God, Divine Physician and Creator of all life,',
    body: [
      'I come before You to give thanks for the gift of my health and the vitality of my body. You have created me in Your image, making my body a temple of the Holy Spirit. Thank You for the strength in my limbs, the rhythm of my breath, and the physical endurance that allows me to actively move, train, and care for the life You have given me.',
      'I ask for Your continued grace to maintain my holistic well-being. Grant me the daily discipline to honor my body through healthy habits, focused effort, and restorative rest. Protect my joints and muscles from injury as I work to build my physical strength, and guard me against illness and fatigue.',
      'Lord, I also pray for my mental and spiritual health. Let my physical energy be matched by a peaceful mind and a joyful spirit. When my body is tired, grant me deep recovery. When I face emotional or physical stress, be my comfort and my healing. May the health and discipline I cultivate always be directed toward serving You and others with a full and grateful heart.',
    ],
    concludeLead: 'Conclude your personal reflection by praying:',
    conclude: conclude(
      'for our daily bread and the physical sustenance of life',
      'for bodily protection, mental peace, and spiritual vitality',
      'in praise of the Creator of all life',
    ),
    saints: [
      'St. Raphael the Archangel, patron of healing, pray for me.',
      'St. Sebastian, patron of athletes and physical endurance, pray for me.',
    ],
  },
  {
    id: 'new-home',
    title: 'A Prayer for Guidance and Grace in Pursuing a New Home',
    short: 'Guidance in Pursuing a New Home',
    address: 'Lord God, You who guide our steps and plant deep desires within our hearts,',
    body: [
      'I come before You today to lift up my greatest dream: to build a permanent life, put down deep roots, and eventually become a citizen of the Netherlands. I know that every good path is paved by Your grace and walked through honest labor, and so I offer all my present efforts to You.',
      'Bless my current preparations, Lord. Give me perseverance in the hours I spend mastering a new language, and grant me focus as I lay the academic foundation for my future studies in economics. When the process feels overwhelming or the goal seems distant, remind me that great things are built step by step.',
      'As I look toward my upcoming journey to the Netherlands, I ask You to go before me. Please grant me favor in my university path, my visa processes, and all the practical transitions required to move to a new country. Protect me from anxiety and grant me a steadfast trust in Your divine providence.',
      'If it is Your holy will, allow me to find a true home in the Netherlands. Help me to integrate well, to respect the culture, and to use the education and talents You have given me to contribute meaningfully to my future community. May this long road toward citizenship be a journey where I grow closer to You, relying always on Your strength.',
    ],
    concludeLead: 'Conclude your personal reflection by praying:',
    conclude: conclude(
      'for trust in God’s perfect timing and will for your future',
      'for perseverance, open doors, and Mary’s motherly protection over your journey',
      'giving thanks for the dreams and ambitions God has placed in your heart',
    ),
    saints: [
      'St. Willibrord, Apostle of the Netherlands, pray for me.',
      'St. Frances Xavier Cabrini, patron of immigrants and those moving to new lands, pray for me.',
    ],
  },
  {
    id: 'peace-of-mind',
    title: 'A Prayer for Peace of Mind and Deliverance from Anxiety',
    short: 'Peace of Mind',
    address: 'Lord Jesus, Prince of Peace,',
    body: [
      'I come to You right now with a heavy and restless heart. My mind is racing, my spirit feels burdened, and I am struggling to find calm in the midst of this anxiety. You know every thought that troubles me and every fear of the unknown that weighs upon my chest.',
      'When I am overwhelmed by the demands of my daily work, the pressure of my studies, and the uncertainty of my future plans, remind me that I do not have to carry this load alone. Forgive me for the times I try to control everything myself, and help me to surrender my worries entirely to Your Sacred Heart.',
      'Breathe Your Holy Spirit into my mind to quiet my anxious thoughts. Grant me the grace to live only in this present moment, trusting that You are already taking care of my tomorrow. When the road ahead feels too steep, give me the strength to simply do the next right thing, relying on Your gentle guidance rather than my own understanding.',
      'Wrap me in Your peace, which surpasses all understanding, and let me rest securely in the knowledge that I am Your child, completely held, entirely safe, and deeply loved.',
    ],
    concludeLead: 'Conclude your personal reflection by praying:',
    conclude: conclude(
      'for the grace to surrender control and trust in His daily provision',
      'for a calm heart, a quiet mind, and the comforting embrace of our Blessed Mother',
      'professing faith that God’s power is infinitely greater than any passing fear',
    ),
    saints: [
      'St. Dymphna, patron of those suffering from anxiety and mental distress, pray for me.',
      'St. Pio of Pietrelcina (Padre Pio), who taught us to “pray, hope, and don’t worry,” pray for me.',
    ],
  },
  {
    id: 'anger-stress',
    title: 'A Prayer for Deliverance from Anger, Hopelessness, and Heavy Stress',
    short: 'Deliverance from Anger and Stress',
    address: 'Heavenly Father, God of endless mercy,',
    body: [
      'I come to You in a moment of exhaustion and darkness. My spirit feels crushed under the weight of my daily work, the strict demands of my studies, and the pressure of the timeline I am facing. This heavy stress has worn down my patience, leaving me quick to anger, easily frustrated by obstacles, and disconnected from Your peace. Forgive my moments of bitterness when the road feels too long and my progress feels too slow.',
      'Lord, when hopelessness begins to creep in and I doubt whether all these long hours of preparation will ever bear fruit, anchor my soul in Your promises. Remind me that You do not abandon the work of Your hands. Lift this heavy fog from my mind. Help me to see beyond my immediate setbacks and the isolation of my daily routine.',
      'Replace the tight, angry tension in my chest with the gentle breath of Your Holy Spirit. Give me the meekness to let go of the outcomes I cannot control, and the resilience to keep faithfully working on the things I can. When I am completely overwhelmed by the sheer volume of what is required of me, grant me the humility to pause, breathe, and trust in Your divine timing rather than my own force of will.',
      'Wash away this despair, Lord, and renew a steadfast spirit within me.',
    ],
    concludeLead: 'Conclude your personal reflection by praying:',
    conclude: conclude(
      'for the grace to forgive yourself and others, and to accept His will in all trials',
      'for patience, comfort in sorrow, and the intercession of our Blessed Mother',
      'to remember that God’s infinite love outlasts all our temporary struggles',
    ),
    saints: [
      'St. Jude Thaddeus, patron of desperate causes and hopeless situations, pray for me.',
      'St. Francis de Sales, who battled his own anger to achieve great gentleness and peace, pray for me.',
    ],
  },
  {
    id: 'clarity-diligence',
    title: 'A Prayer for Intellectual Clarity and Steadfast Diligence',
    short: 'Intellectual Clarity and Diligence',
    address: 'O God of infinite wisdom and source of all truth,',
    body: [
      'I come before You today acknowledging that every good and perfect gift comes from Your hands. I thank You for the mind You have given me and the tremendous opportunity to learn, to grow, and to prepare for my future.',
      'As I dive into complex theories, numbers, and new languages today, I ask for the grace of a sharpened intellect. Send the Holy Spirit to clear away the fog of confusion. Grant me a retentive memory, a quick understanding, and the ability to grasp difficult concepts with clarity. Help me to see the order, truth, and beauty in all the knowledge I am working so hard to acquire.',
      'Lord, I know that intellect means little without the discipline to apply it. Therefore, I pray for the gift of unwavering diligence. When my motivation fades, when the material becomes dense, and when the long hours of study stretch out before me, give me the strength to remain seated and focused. Guard my mind against procrastination and idle distractions. When I am tempted to cut corners or give less than my best effort, renew my endurance.',
      'Help me to treat my rigorous study routine not as a chore, but as a sacred duty and a stepping stone toward the life You are calling me to build. May the work ethic I forge today prepare me to serve others with excellence tomorrow.',
    ],
    concludeLead: 'Conclude your personal reflection by praying:',
    conclude: conclude(
      'for the daily bread of grace, energy, and discipline to do the work required of you',
      'for a focused mind, a willing heart, and the intercession of Mary, Seat of Wisdom',
      'giving thanks for the gift of human reason and the freedom to study',
    ),
    saints: [
      'St. Thomas Aquinas, patron of students and scholars, pray for me.',
      'St. Albert the Great, patron of those who study logic and the sciences, pray for me.',
    ],
  },
  {
    id: 'integrity',
    title: 'A Prayer for Moral Courage and Steadfast Integrity',
    short: 'Moral Courage and Integrity',
    address: 'Lord God of all truth and holiness,',
    body: [
      'I come before You today aware of my own human weakness and my absolute need for Your grace. You have called me to live as a light in this world, and I ask for the strength to uphold the highest standards of morality, honesty, and integrity in every area of my life.',
      'As I build the foundation for my future and navigate the daily demands of my studies and work, guard my heart against the quiet temptations of ambition, pride, and convenience. Let me never compromise my values or cut ethical corners for the sake of a quick success or an easier path. Give me the courage to choose what is right over what is easy, and to maintain strict honesty in my academic efforts, my future career, and my private habits.',
      'Lord, protect my mind and my senses from the subtle snares of the enemy. Give me the wisdom to recognize evil, even when it is disguised as something appealing, and the iron will to turn away from it immediately. When I am tested, do not let me rationalize small sins, but help me to stand firm in my convictions, even if it means standing alone.',
      'Purify my intentions so that whoever I interact with today sees a reflection of Your goodness. Let my hidden life—the choices I make when no one else is watching—be as honorable as my public life, so that I may always stand before You with a clear conscience.',
    ],
    concludeLead: 'Conclude your personal reflection by praying:',
    conclude: conclude(
      'for the daily grace to resist temptation, and the plea to “deliver us from evil”',
      'for purity of heart, moral courage, and the protective mantle of our Blessed Mother',
      'professing that an upright and honest life is lived for the glory of God',
    ),
    saints: [
      'St. Michael the Archangel, our protector in battle against wickedness and snares, pray for me.',
      'St. Thomas More, patron of those who hold fast to their conscience and integrity, pray for me.',
    ],
  },
  {
    id: 'family',
    title: 'A Prayer for My Parents and Little Sister Across the Miles',
    short: 'My Parents and Little Sister',
    address: 'Lord God, Heavenly Father, who binds us together in perfect love,',
    body: [
      'I lift my heart to You today, carrying the faces of those I hold most dear: my dad, my mum, and my little sister back home in Indonesia. Though thousands of miles and different time zones separate us while I build my life here in the Netherlands, I take immense comfort in knowing that distance means nothing to You, and that we are always united in Your presence.',
      'Pour out Your abundant blessings upon my parents. I thank You for their endless sacrifices, their hard work, and the steady love that has given me the foundation to pursue my dreams so far from home. Grant them robust physical health, daily joy, and profound peace of mind. When they miss me or worry about me being across the world, comfort their hearts with the gentle reassurance of Your Holy Spirit, and let them know I am safe under Your care.',
      'Watch over my little sister. Protect her daily steps, guide her mind in her own studies and life, and keep her safe from all physical and spiritual harm. Help her to grow in wisdom and grace. Let her always know how deeply I love her and how proud I am of her, even when I cannot be there beside her.',
      'Lord, do not let this physical distance weaken our family bond. Keep us closely connected through our prayers, our conversations, and our shared faith. Protect our home in Indonesia, and bless my efforts here in the Netherlands, so that my work may honor the family name and bring joy to their hearts.',
    ],
    concludeLead: 'Conclude your personal reflection by praying:',
    conclude: conclude(
      'for the daily protection, provision, and unity of your family',
      'for the health of your parents, the safety of your sister, and the comforting embrace of our Blessed Mother over your home',
      'giving thanks for the gift of your family and the love that spans across the world',
    ),
    saints: [
      'St. Joseph, protector and head of the Holy Family, pray for us.',
      'St. Raphael the Archangel, guardian of travelers and those far from home, pray for us.',
    ],
  },
  {
    id: 'prosperity',
    title: 'A Prayer for Honest Prosperity and a Blessed Life in the Netherlands',
    short: 'Honest Prosperity',
    address: 'Heavenly Father, source of all abundance and grace,',
    body: [
      'I come before You with hopeful expectations for my future and the life I am working so hard to build. As I prepare to move to the Netherlands and advance my education in economics and business, I humbly ask for Your blessing upon my ambitions.',
      'Lord, I pray for a future of honest prosperity, financial stability, and a high quality of life in my new home. Open the right doors for me in the Dutch professional world, and bless the work of my hands so that it may bear rich fruit. Grant me a safe and comfortable home, a thriving community, and the resources to live a peaceful, well-ordered life.',
      'Protect my heart, Lord, so that I never lose sight of You in the pursuit of success. Let the prosperity I seek never become an idol, but rather a tool to do good. Grant that the financial security I build may allow me to live without constant worldly anxiety, to eventually provide for a family of my own.',
      'Keep me grounded in the truth that all wealth and opportunities are gifts from Your hand. May my life in the Netherlands be prosperous not only in material comfort and career success, but also rich in faith, charity, and gratitude to You, the Giver of all good things.',
    ],
    concludeLead: 'Conclude your personal reflection by praying:',
    conclude: conclude(
      'for the daily provision of your needs and the grace to use your future resources wisely',
      'for open doors in your career, a peaceful home in the Netherlands, and Mary’s guidance in your financial decisions',
      'professing that all success, wealth, and earthly comforts ultimately belong to the glory of God',
    ),
    saints: [
      'St. Homobonus, patron of business people and honest prosperity, pray for me.',
      'St. Nicholas, patron of Amsterdam and model of generous giving, pray for me.',
    ],
  },
  {
    id: 'humility',
    title: 'A Prayer for a Humble Heart and Teachable Spirit',
    short: 'A Humble Heart',
    address: 'Lord Jesus, You who are gentle and humble of heart,',
    body: [
      'I come before You asking for a virtue that is often difficult to practice in a world that praises self-reliance and status. As I dedicate myself to rigorous studies, ambitious goals, and the pursuit of a successful future, I ask You to protect my heart from the quiet poison of pride.',
      'When I master a difficult subject, solve a complex problem, or achieve a milestone I have worked hard for, remind me instantly that my intellect, my health, and my very breath are entirely gifts from You. Keep me from the illusion that I am completely self-made. Strip away any intellectual arrogance, and prevent me from ever tying my inherent worth to my academic grades, my future income, or the approval of the professional world.',
      'Grant me a deeply teachable spirit, Lord. Give me the grace to accept correction gracefully, to admit when I am wrong, and to listen to others without always needing to prove I am right. When I am tempted to look down on those who may not share my drive or my advantages, replace my judgment with profound gratitude and compassion.',
      'Help me to remember that true greatness in Your kingdom is found in service. May the education I gain and the prosperity I hope to build never make me distant from You or from the needs of others, but instead make me a more capable and generous servant of Your will.',
    ],
    concludeLead: 'Conclude your personal reflection by praying:',
    conclude: conclude(
      'for the humility to truly mean “Thy will be done,” rather than our own',
      'for the grace to imitate Mary’s humble “fiat” and total submission to God',
      'deflecting all praise away from ourselves and directing it back to the Holy Trinity',
    ),
    saints: [
      'St. Thérèse of Lisieux, who found immense holiness in the humble “Little Way,” pray for me.',
      'St. John the Baptist, who said, “He must increase, but I must decrease,” pray for me.',
    ],
  },
  {
    id: 'road-safety',
    title: 'A Prayer for Safety and Protection on the Road',
    short: 'Safety on the Road',
    address: 'Heavenly Father, Lord of all journeys,',
    body: [
      'As I step out onto the roads today, whether I am driving behind the wheel or riding my bicycle, I humbly ask for Your divine protection. You know the fast pace of the world, the heavy traffic, and the sudden dangers that can arise in an instant. Guard my travels from the moment I leave my door until I safely arrive at my destination.',
      'Protect me from accidents, unseen hazards, and the unpredictable actions of others. Give me sharp reflexes, clear vision, and an attentive mind so that I may operate my vehicle and ride my bike safely. Guard me against distractions, fatigue, and carelessness.',
      'Lord, I also ask for the grace of a patient spirit. When I encounter heavy traffic, delays, or reckless behavior from others, keep my temper calm. Guard my heart against frustration and road rage. Help me to share the road with charity and respect, remembering that every person passing by is, like me, trying to safely reach their work, their studies, or their family.',
      'Send Your holy angels to travel beside me, to guide my path, and to bring me safely home at the end of the day.',
    ],
    concludeLead: 'Conclude your personal reflection by praying:',
    conclude: conclude(
      'for a patient heart and the grace to share the road charitably with others',
      'for physical safety, mental alertness, and the protective mantle of our Blessed Mother over your journey',
      'giving thanks for safe departures and safe arrivals',
    ),
    saints: [
      'St. Christopher, patron of travelers and motorists, pray for me.',
      'My Guardian Angel, appointed by God to light, guard, rule, and guide me, protect me on my way.',
    ],
  },
];

// The words of the three closing prayers, used if rosary-data.js isn't on the page.
export const COMMON_PRAYERS = {
  ourFather: 'Our Father, Who art in Heaven, hallowed be Thy Name; Thy Kingdom come; Thy Will be done on earth as it is in Heaven. Give us this day our daily bread, and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
  hailMary: 'Hail Mary, full of grace, the Lord is with Thee; blessed art Thou amongst women, and blessed is the Fruit of Thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
  gloryBe: 'Glory be to the Father, and to the Son, and to the Holy Ghost. As it was in the beginning, is now, and ever shall be, world without end. Amen.',
};
