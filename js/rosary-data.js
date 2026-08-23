/* Data for the Rosary tab (from "Pray the Rosary", The Fatima Center booklet,
   compiled from The Secret of the Rosary by St. Louis de Montfort and other approved sources)
   and the Three Hail Marys tab (from the user's Three Hail Marys document). */

const ROSARY = {
  steps: [
    "Sign of the Cross", "Apostles’ Creed", "Our Father", "3 Hail Marys", "Glory Be",
    "Announce 1st Mystery; Our Father", "10 Hail Marys", "Glory Be & Fatima Prayer",
    "Announce 2nd Mystery; Our Father", "10 Hail Marys", "Glory Be & Fatima Prayer",
    "Announce 3rd Mystery; Our Father", "10 Hail Marys", "Glory Be & Fatima Prayer",
    "Announce 4th Mystery; Our Father", "10 Hail Marys", "Glory Be & Fatima Prayer",
    "Announce 5th Mystery; Our Father", "10 Hail Marys", "Glory Be & Fatima Prayer",
    "Hail Holy Queen; Concluding Prayer"
  ],

  prayers: {
    en: {
      sign: "In the Name of the Father, and of the Son, and of the Holy Ghost. Amen.",
      creed: "I believe in God, the Father Almighty, Creator of Heaven and earth; and in Jesus Christ, His only Son, our Lord; Who was conceived by the Holy Ghost, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. He descended into hell; the third day He arose again from the dead. He ascended into Heaven, sitteth at the right hand of God, the Father Almighty; from thence He shall come to judge the living and the dead. I believe in the Holy Ghost, the Holy Catholic Church, the Communion of Saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
      ourFather: "Our Father, Who art in Heaven, hallowed be Thy Name; Thy Kingdom come; Thy Will be done on earth as it is in Heaven. Give us this day our daily bread, and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
      hailMary: "Hail Mary, full of grace, the Lord is with Thee; blessed art Thou amongst women, and blessed is the Fruit of Thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
      gloryBe: "Glory be to the Father, and to the Son, and to the Holy Ghost. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
      fatima: "O my Jesus, forgive us our sins; save us from the fires of hell; lead all souls to Heaven, especially those most in need.",
      hailHolyQueen: "Hail, Holy Queen, Mother of Mercy, Hail our life, our sweetness, and our hope. To Thee do we cry, poor banished children of Eve. To Thee do we send up our sighs, mourning and weeping in this vale of tears. Turn, then, Most gracious Advocate, Thine eyes of mercy toward us, and after this our exile show unto us the blessed Fruit of Thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.\nV. Pray for us, O Holy Mother of God.\nR. That we may be made worthy of the promises of Christ.",
      conclusion: "Let us pray. O God, Whose only begotten Son, by His Life, Death, and Resurrection hath purchased for us the rewards of eternal salvation; grant, we beseech Thee, that by meditating upon these Mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise. Through the same Christ our Lord. Amen."
    },
    la: {
      sign: "In Nómine Patris, et Fílii et Spíritus Sancti. Amen.",
      creed: "Credo in Deum, Patrem omnipoténtem, Creatórem cæli et terræ; et in Jesum Christum, Fílium Ejus únicum, Dóminum nostrum; qui concéptus est de Spíritu Sancto, natus ex María Vírgine, passus sub Póntio Piláto, crucifíxus, mórtuus et sepúltus; descéndit ad ínferos, tértia die resurréxit a mórtuis, ascéndit ad cælos, sedet ad déxteram Dei Patris omnipoténtis, inde ventúrus est judicáre vivos et mórtuos. Credo in Spíritum Sanctum, Sanctam Ecclésiam Cathólicam, Sanctórum Communiónem, remissiónem peccatórum, carnis resurrectiónem, et vitam ætérnam. Amen.",
      ourFather: "Pater noster, Qui es in cælis, sanctificétur Nomen Tuum; advéniat regnum Tuum; fiat volúntas Tua, sicut in cælo et in terra. Panem nostrum quotidiánum da nobis hódie, et dimítte nobis débita nostra, sicut et nos dimíttimus debitóribus nostris, et ne nos indúcas in tentatiónem, sed líbera nos a malo. Amen.",
      hailMary: "Ave María, grátia plena, Dóminus Tecum; benedícta Tu in muliéribus, et benedíctus fructus ventris Tui, Jesus. Sancta María, Mater Dei, ora pro nobis peccatóribus, nunc et in hora mortis nostræ. Amen.",
      gloryBe: "Glória Patri et Fílio et Spirítui Sancto. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen.",
      fatima: "O mi Jesu, dimítte nobis peccáta nostra; líbera nos ab ígnibus inférni; perduc omnes ánimas in cælum, præsértim máxime indigéntes. Amen.",
      hailHolyQueen: "Salve, Regína, Mater misericórdiæ; vita, dulcédo et spes nostra, salve. Ad Te clamámus, éxsules fílii Evæ. Ad Te suspirámus, geméntes et flentes, in hac lacrymárum valle. Eia ergo, Advocáta nostra, illos Tuos misericórdes óculos ad nos convérte. Et Jesum, benedíctum fructum ventris Tui, nobis post hoc exsílium osténde. O clemens, O pia, O dulcis Virgo María.\nV. Ora pro nobis, sancta Dei Génitrix.\nR. Ut digni efficiámur promissiónibus Christi.",
      conclusion: "Orémus: Deus, cujus Unigénitus per vitam, mortem et resurrectiónem suam nobis salútis ætérnæ prǽmia comparávit: concéde, quǽsumus: ut hæc mystéria sacratíssimo beátæ Maríæ Vírginis Rosário recoléntes, et imitémur quod cóntinent, et quod promíttunt assequámur. Per eúndem Christum Dóminum nostrum. Amen."
    }
  },

  mysteryEnd: "May the grace of this Mystery come down into my soul.",

  beforePrayer: "Queen of the Holy Rosary, Thou didst deign to come to Fatima to reveal to the three shepherd children the treasures of grace hidden in the Rosary. Inspire my heart with a sincere love of this devotion, in order that by meditating on the Mysteries of our Redemption which are recalled in it, I may be enriched by its fruits and obtain the Consecration and conversion of Russia, the conversion of sinners, peace for the world, and the graces which I ask of Thee in this Rosary. (Here mention your requests.) I ask this for the greater glory of God, for Thine own honor, and for the good of souls, especially for my own. Amen.\n\nI offer this Rosary for the purpose of knowing the Truth and obtaining contrition and pardon for my sins. Amen.",

  mysteries: {
    "Joyful": [
      { name: "The Annunciation",
        reflect: "God sent the angel Gabriel to announce to the Virgin Mary that She was chosen to become the Mother of God the Son.\n“And the angel being come in, said unto Her: Hail, full of grace, the Lord is with Thee: Blessed art Thou among women. Behold Thou shalt conceive in Thy womb, and shalt bring forth a Son; and Thou shalt call His name Jesus. He shall be great, and shall be called the Son of the Most High; and the Lord God shall give unto Him the throne of David His father; and He shall reign in the house of Jacob for ever. And of His kingdom there shall be no end.” (Lk 1:28, 31-33)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thine Incarnation and we ask of Thee, through this Mystery and through the intercession of Thy most Holy Mother, the grace of profound humility." },
      { name: "The Visitation",
        reflect: "Having been told that Her cousin Elizabeth had conceived a child in her old age, Mary went with haste to visit and help Her cousin.\n“When Elizabeth heard the salutation of Mary, the infant leaped in her womb. And Elizabeth was filled with the Holy Ghost: And she cried out with a loud voice and said: Blessed art Thou among women, and blessed is the Fruit of Thy womb. And whence is this to me, that the Mother of my Lord should come to me?” (Lk 1:41-43)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of the Visitation of Thy Holy Mother to Her cousin St. Elizabeth, and we ask of Thee through this Mystery and through the intercession of Thy most Holy Mother, the grace of perfect charity towards our neighbor." },
      { name: "The Nativity",
        reflect: "The Virgin Mary gave birth to the Divine Infant, the Son of God, in a stable in Bethlehem.\n“And She brought forth Her firstborn Son, and wrapped Him up in swaddling clothes, and laid Him in a manger, because there was no room for them in the inn. And the angel said to the shepherds: Fear not; for, behold, I bring you good tidings of great joy. For this day is born to you a Savior, Who is Christ the Lord.” (Lk 2:7, 10-11)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy Blessed Nativity, and we ask of Thee, through this Mystery and through the intercession of Thy most Holy Mother, the grace of detachment from the things of this world, love of poverty, and love of the poor." },
      { name: "The Presentation",
        reflect: "The Immaculate Virgin Mary presented Jesus in the Temple, and though not obligated to do so, humbly fulfilled what was prescribed in the Law for Her “purification.”\n“And after the days of Her purification, according to the Law of Moses, were accomplished, they carried Him to Jerusalem, to present Him to the Lord: As it is written in the law of the Lord: Every male opening the womb shall be called holy to the Lord: And to offer a sacrifice, according as it is written.” (Lk 2:22-24)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy Presentation in the Temple by the hands of Mary, and the Purification of the Blessed Virgin, and we ask of Thee, through this Mystery and through the intercession of Thy most Holy Mother, the grace and gift of wisdom and purity of heart, mind, and body." },
      { name: "The Finding of Jesus in the Temple",
        reflect: "The Child Jesus remained in the Temple with the learned men for three days, listening to them and asking them questions.\n“And it came to pass, that, after three days, they found Him in the Temple, sitting in the midst of the doctors, hearing them, and asking them questions. And all that heard Him were astonished at His wisdom and His answers. And seeing Him, they wondered. And His Mother said to Him: Son, why hast Thou done so to us? Behold Thy father and I have sought Thee sorrowing.” (Lk 2:46-48)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy Finding in the Temple among the learned men by Our Lady, after She had lost Thee, and we ask Thee, through this Mystery and through the intercession of Thy most Holy Mother, to convert us and help us amend our lives and also to convert all sinners, heretics, schismatics, and idolaters." }
    ],
    "Sorrowful": [
      { name: "The Agony in the Garden",
        reflect: "About to be betrayed, Our Lord prays in the Garden of Gethsemane. He sees our sins, which He will die for; He sees those who will be lost, He sweats blood.\n“He went, according to His custom, to the Mount of Olives. And His disciples also followed Him. And kneeling down, He prayed, and His sweat became as drops of blood, trickling down upon the ground. And he that was called Judas drew near to Jesus, for to kiss Him. And Jesus said to him: Judas, dost thou betray the Son of Man with a kiss?” (Lk 22:39, 41, 44, 47-48)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy mortal Agony in the Garden of Olives and we ask of Thee, through this Mystery and through the intercession of Thy Blessed Mother, the grace of perfect sorrow for our sins and the virtue of perfect obedience to Thy Holy Will." },
      { name: "The Scourging at the Pillar",
        reflect: "Jesus allows Himself to be bound to a pillar and cruelly scourged to atone for our sins of impurity and sensuality.\n“Then, therefore, Pilate took Jesus and scourged Him.” (Jn 19:1)\n“But He was wounded for our iniquities; He was bruised for our sins: the chastisement of our peace was upon Him, and by His bruises we are healed.” (Is 53:5)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy bloody scourging and we ask of Thee, through this mystery and through the intercession of Thy Blessed Mother, the grace to mortify our senses perfectly." },
      { name: "The Crowning with Thorns",
        reflect: "Jesus is crowned with thorns and mocked.\n“And stripping Him, they put a scarlet cloak about Him. And platting a crown of thorns, they put it upon His head, and a reed in His right hand. And bowing the knee before Him, they mocked Him, saying: Hail, King of the Jews. And spitting upon Him, they took the reed, and struck His head. And after they had mocked Him, they took off the cloak from Him, and put on Him His own garments, and led Him away to crucify Him.” (Mt 27:28-31)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy cruel crowning with thorns, and we ask of Thee, through this Mystery and through the intercession of Thy Blessed Mother, the grace of great contempt for the world." },
      { name: "The Carrying of the Cross",
        reflect: "Jesus, condemned to death, carries the cross to Calvary.\n“Pilate said: Shall I crucify your king? The chief priests answered: We have no king but Caesar. Then therefore he delivered Him to them to be crucified. And they took Jesus, and led Him forth. And bearing His own cross, He went forth to that place which is called Calvary, but in Hebrew Golgotha.” (Jn 19:15-17)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy carrying Thy cross and we ask of Thee, through this Mystery and through the intercession of Thy Blessed Mother, the grace of great patience in carrying our cross in Thy footsteps every day of our life." },
      { name: "The Crucifixion",
        reflect: "Jesus is crucified and hangs on the Cross for three hours, in unspeakable suffering. He dies in order to save us from hell.\n“They crucified Him, and with Him two others, one on each side, and Jesus in the midst. Pilate wrote a title also, and he put it upon the cross. And the writing was: Jesus of Nazareth, the King of the Jews.” (Jn 19:18-19)\n“It was almost the sixth hour; and there was darkness over all the earth until the ninth hour. The sun was darkened, and the veil of the temple was rent in the midst. And Jesus, crying with a loud voice, said: Father, into Thy hands I commend My spirit. And saying this, He gave up the ghost.” (Lk 23:44-46)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy Crucifixion on Mount Calvary, and we ask of Thee, through this Mystery and through the intercession of Thy Blessed Mother, the grace of a great horror of sin, a love of the Cross, and a holy death for us and for those who are now in their last agony." }
    ],
    "Glorious": [
      { name: "The Resurrection",
        reflect: "Jesus Christ rises gloriously from the dead on Easter Sunday morning.\n“And very early in the morning, the first day of the week, they come to the sepulcher. And looking, they saw the stone rolled back. Entering into the sepulcher, they saw a young man clothed with a white robe who saith to them: Be not affrighted; you seek Jesus of Nazareth, Who was crucified: He is risen, He is not here. But go, tell His disciples.” (Mk 16:2, 4-7)\n“And it was Mary Magdalen, and Joanna, and Mary of James, and the other women who told these things to the Apostles.” (Lk 24:10)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy triumphant Resurrection and we ask of Thee, through this Mystery and through the intercession of Thy Blessed Mother, the grace of a lively faith." },
      { name: "The Ascension",
        reflect: "The Apostles look on in adoration as Jesus ascends triumphantly into Heaven.\n“Jesus said to them: You shall be witnesses unto Me in Jerusalem, and even to the uttermost part of the earth. And when He had said these things, while they looked on, He was raised up. And while they were beholding Him going up to Heaven, behold two men stood by them in white garments. Who also said: Ye men of Galilee, why stand you looking up to Heaven? This Jesus Who is taken up from you into Heaven, shall so come, as you have seen Him going into Heaven.” (Acts 1:7-11)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy glorious Ascension, and we ask of Thee, through this Mystery and through the intercession of Thy Blessed Mother, the grace of firm hope and great longing for Heaven." },
      { name: "The Descent of the Holy Ghost",
        reflect: "The Holy Ghost descends upon the Apostles to enlighten, guide, strengthen, and sanctify them.\n“When the days of the Pentecost were accomplished, they were all together in one place: And suddenly there came a sound from Heaven, as of a mighty wind coming, and it filled the whole house where they were sitting. And there appeared to them parted tongues as it were of fire, and it sat upon every one of them: And they were all filled with the Holy Ghost.” (Acts 2:1-4)",
        pray: "We offer Thee, O Holy Ghost, this decade in honor of the Mystery of Pentecost, and we ask of Thee, through this Mystery and through the intercession of Thy most faithful Spouse, the grace of Thy holy wisdom so that we may know all the Truth necessary for salvation, really love the Truth, live by the Truth, and persevere in living the Truth." },
      { name: "The Assumption",
        reflect: "The Blessed Virgin Mary is assumed, body and soul, into Heaven.\n“I am the Mother of fair love, and of fear, and of knowledge, and of holy hope. From the beginning, and before the world, was I created, and unto the world to come I shall not cease to be, and in the holy dwelling place I have ministered before Him. And I took root in an honorable people, and in the portion of My God His inheritance, and My abode is in the full assembly of saints.” (Eccus 24:24, 14, 16)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of the Immaculate Conception and the Assumption of Thy most Blessed Mother, body and soul, into Heaven; and we ask of Thee, through these two Mysteries and through Her intercession, the grace and the gift of true devotion to Her, that we may live a holy life, die a happy death, and attain everlasting life with Thee." },
      { name: "The Coronation",
        reflect: "The Blessed Virgin Mary is crowned Queen of Heaven and Earth. She is Mother of all men, and Mediatrix of all graces.\n“A great sign appeared in Heaven: a Woman clothed with the sun, and the moon was under Her feet, and on Her head a crown of twelve stars.” (Apoc 12:1)\n“In Me is all grace of the way and of the truth; in Me is all hope of life and of virtue. He that hearkeneth to Me, shall not be confounded: and they that work by Me, shall not sin. They that explain Me shall have life everlasting.” (Eccus 24:25, 30-31)",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of the glorious crowning of Thy Blessed Mother in Heaven, and we ask of Thee, through this Mystery and through Her intercession, the grace of final perseverance and increase of virtue until the very moment of death; and after that, may we receive the eternal crown that is prepared for us." }
    ],
    "Luminous": [
      { name: "The Baptism of Jesus in the Jordan",
        reflect: "Jesus, though sinless, humbly receives the baptism of John, and the Most Holy Trinity is revealed over the waters of the Jordan.\n“And Jesus being baptized, forthwith came out of the water: and lo, the heavens were opened to Him: and He saw the Spirit of God descending as a dove, and coming upon Him. And behold a voice from heaven, saying: This is My beloved Son, in Whom I am well pleased.” (Mt 3:16-17)\nFruit of the Mystery: openness to the Holy Ghost.",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy Baptism in the Jordan, and we ask of Thee, through this Mystery and through the intercession of Thy most Holy Mother, the grace of openness to the Holy Ghost and fidelity to the promises of our own baptism." },
      { name: "The Wedding Feast at Cana",
        reflect: "At Mary's request, Jesus works His first miracle, changing water into wine and manifesting His glory.\n“His Mother saith to the waiters: Whatsoever He shall say to you, do ye. Jesus saith to them: Fill the waterpots with water. And they filled them up to the brim.” (Jn 2:5, 7)\n“This beginning of miracles did Jesus in Cana of Galilee; and manifested His glory, and His disciples believed in Him.” (Jn 2:11)\nFruit of the Mystery: to Jesus through Mary.",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy first miracle at Cana, wrought at the word of Thy Mother, and we ask of Thee, through this Mystery and through Her intercession, the grace to do whatsoever Thou tellest us, and to come to Thee always through Mary." },
      { name: "The Proclamation of the Kingdom of God",
        reflect: "Jesus proclaims the coming of the Kingdom, calls all to conversion, and forgives the sins of those who draw near to Him in humble trust.\n“The time is accomplished, and the kingdom of God is at hand: repent, and believe the gospel.” (Mk 1:15)\n“And going, preach, saying: The kingdom of heaven is at hand. Heal the sick, raise the dead, cleanse the lepers, cast out devils: freely have you received, freely give.” (Mt 10:7-8)\nFruit of the Mystery: repentance and trust in God.",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy proclamation of the Kingdom of God, and we ask of Thee, through this Mystery and through the intercession of Thy most Holy Mother, the grace of true repentance for our sins and unshakable trust in Thy mercy." },
      { name: "The Transfiguration",
        reflect: "On the mountain, the glory of the Godhead shines forth from the face of Christ, and the Father commands the Apostles to listen to Him.\n“And whilst He prayed, the shape of His countenance was altered, and His raiment became white and glittering.” (Lk 9:29)\n“And a voice came out of the cloud, saying: This is My beloved Son; hear ye Him.” (Lk 9:35)\nFruit of the Mystery: desire for holiness.",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy glorious Transfiguration, and we ask of Thee, through this Mystery and through the intercession of Thy most Holy Mother, the grace of a deep desire for holiness, that hearing Thee we may be transformed by Thy light." },
      { name: "The Institution of the Holy Eucharist",
        reflect: "At the Last Supper, Jesus gives us His own Body and Blood, instituting the Holy Eucharist as the sacrament of His abiding presence.\n“And taking bread, He gave thanks, and brake; and gave to them, saying: This is My body, which is given for you. Do this for a commemoration of Me. In like manner the chalice also, after He had supped, saying: This is the chalice, the new testament in My blood, which shall be shed for you.” (Lk 22:19-20)\nFruit of the Mystery: adoration.",
        pray: "We offer Thee, O Lord Jesus, this decade in honor of Thy institution of the Most Holy Eucharist, and we ask of Thee, through this Mystery and through the intercession of Thy most Holy Mother, the grace of profound adoration and love for Thee in the Blessed Sacrament." }
    ]
  },

  promises: [
    "Whoever shall faithfully serve Me by the recitation of the Rosary shall receive signal graces.",
    "I promise My special protection and the greatest graces to all those who shall recite the Rosary.",
    "The Rosary shall be a powerful armor against hell. It will destroy vice, decrease sin, and defeat heresies.",
    "It will cause virtue and good works to flourish; it will obtain for souls the abundant mercy of God; it will withdraw the hearts of men from the love of the world and its vanities, and will lift them to the desire of eternal things. Oh, that souls would sanctify themselves by this means!",
    "The soul which recommends itself to Me by the recitation of the Rosary shall not perish.",
    "Whoever shall recite the Rosary devoutly, applying himself to the consideration of its sacred mysteries, shall never be conquered by misfortune. God will not chastise him in His justice, and he shall not perish by an unprovided death; if he be just, he shall remain in the grace of God and become worthy of eternal life.",
    "Whoever shall have a true devotion for the Rosary shall not die without the Sacraments of the Church.",
    "Those who are faithful in reciting the Rosary shall have during their life, and at their death, the light of God and the plentitude of His graces. At the moment of death, they shall participate in the merits of the saints in Paradise.",
    "I shall deliver from Purgatory those who have been devoted to the Rosary.",
    "The faithful children of the Rosary shall merit a high degree of glory in Heaven.",
    "You shall obtain all you ask of Me by the recitation of the Rosary.",
    "All those who propagate the Holy Rosary shall be aided by Me in their necessities.",
    "I have obtained from My Divine Son that all the advocates of the Rosary shall have for intercessors the entire celestial court during their life and at the hour of death.",
    "All who recite the Rosary are My sons, and brothers of My only Son Jesus Christ.",
    "Devotion to My Rosary is a great sign of predestination."
  ],

  fatimaWords: [
    { q: "Pray the Rosary every day in order to obtain peace for the world, and the end of the war.", d: "May 13, 1917" },
    { q: "I wish you to come here on the 13th of next month, to pray the Rosary each day.", d: "June 13, 1917" },
    { q: "I want you to come here on the 13th of next month, and to continue praying the Rosary every day in honor of Our Lady of the Rosary, in order to obtain peace for the world and the end of the war, because only She can help you.", d: "July 13, 1917" },
    { q: "I want you to continue praying the Rosary every day.", d: "August 19, 1917" },
    { q: "Continue to say the Rosary to obtain the end of the war.", d: "September 13, 1917" },
    { q: "I am the Lady of the Rosary. Continue to say the Rosary every day.", d: "October 13, 1917" },
    { q: "You at least try to console Me and announce in My name that I promise to assist at the moment of death, with all the graces necessary for salvation, all those who, on the First Saturday of five consecutive months shall confess, receive Holy Communion, recite five decades of the Rosary, and keep Me company for fifteen minutes while meditating on the fifteen Mysteries of the Rosary, with the intention of making reparation to Me.", d: "December 10, 1925 to Sister Lucia at Pontevedra" }
  ],

  fatimaPrayers7: [
    "My God, I believe, I adore, I hope and I love Thee. I ask pardon for those who do not believe, do not adore, do not hope, and do not love Thee.",
    "Most Holy Trinity, Father, Son and Holy Ghost, I adore Thee profoundly, and I offer Thee the Most Precious Body, Blood, Soul and Divinity of Jesus Christ, present in all the Tabernacles of the world, in reparation for the outrages, sacrileges and indifference with which He Himself is offended. And through the infinite merits of His Most Sacred Heart and of the Immaculate Heart of Mary, I beg of Thee the conversion of poor sinners.",
    "O Most Holy Trinity, I adore Thee; My God, My God, I love Thee in the Most Blessed Sacrament.",
    "O My Jesus, forgive us our sins, save us from the fires of hell; lead all souls to Heaven, especially those most in need.",
    "O My Jesus, it is for love of Thee, for the conversion of sinners, and in reparation for sins committed against the Immaculate Heart of Mary, I offer this sacrifice to Thee.",
    "Sweet Heart of Mary, be the salvation of Russia, Spain, Portugal, Europe, (your nation[s]) and the whole world.",
    "By Thy pure and Immaculate Conception, O Mary, obtain for me the conversion of Russia, Spain, Portugal, Europe, (your nation[s]) and the whole world."
  ],

  novena: {
    intro: "The Miraculous 54-Day Rosary Novena consists of five decades of the Rosary each day for twenty-seven days in petition; then immediately five decades each day for an additional twenty-seven days in thanksgiving, whether or not the request has been granted.",
    pattern: "The meditations vary from day to day. On the first day, meditate on the Joyful Mysteries; on the second day, the Sorrowful Mysteries; on the third day, the Glorious Mysteries; on the fourth day, meditate again on the Joyful Mysteries; and so on throughout the fifty-four days.",
    story: "This devotion traces back to March 3, 1884, when Our Lady of Pompeii appeared to Fortuna Agrelli, the gravely ill daughter of an Italian military officer whose case doctors had given up as hopeless. Our Lady told her: “Whoever desires to obtain favors from Me should make three novenas in petition of the prayers of the Rosary, and three novenas in thanksgiving.” Fortuna and her family completed the six novenas, and she was restored to perfect health."
  },

  sisterLucia: "Sister Lucia of Fatima taught that the Most Holy Virgin has given a new efficacy to the Rosary in our times — that there is no problem, however difficult, whether temporal or spiritual, in our personal lives, our families, or the life of nations, that cannot be resolved by the prayer of the Holy Rosary."
};

const THREE_HM = {
  what: "The Three Hail Marys is one of the simplest and most beloved devotions to the Blessed Virgin Mary: three Hail Marys prayed each morning and each evening, honoring the three great gifts God bestowed upon Our Lady — Her Power, Her Wisdom, and Her Mercy. Rooted in a revelation to St. Mechtilde and spread by saints such as St. Leonard of Port Maurice and St. Alphonsus Liguori, it takes only a minute, yet the saints attached to it a lifetime of graces.",
  how: [
    "Each morning when you rise, pray three Hail Marys in honor of Mary's Power, Wisdom, and Mercy, adding: “O my Mother, preserve me this day from mortal sin.”",
    "Each evening before sleep, pray the three Hail Marys again, adding: “O my Mother, preserve me this night from mortal sin.”",
    "Bring a special intention to Our Lady through the devotion — the prayers below name each gift being honored before its Hail Mary.",
    "To pray it as a novena, recite the three prayers below faithfully each of nine days, naming your intention where indicated."
  ],
  benefits: [
    "Perseverance and protection: the devotion is prayed above all for the grace of avoiding mortal sin and remaining faithful to God each day and night.",
    "A remedy in temptation and trial: honoring Mary's Power asks strength to overcome every enemy of the soul.",
    "Light for decisions: honoring Her Wisdom asks meekness, humility, and a clear knowledge of God's will — and the strength to do it.",
    "Hope for the sinner: honoring Her Mercy asks true contrition and confidence in Mary as Mother of penitent sinners.",
    "A promise of a happy death: tradition holds that Our Lady revealed to St. Mechtilde that she will assist at the hour of death those who faithfully honor Her Power, Wisdom, and Mercy in this way."
  ],
  novenaTitle: "Daily Novena Prayer",
  novenaIntro: "Recite these prayers faithfully each of the nine days to honor the Blessed Virgin Mary and seek her motherly intercession.",
  sections: [
    { title: "In Honor of Our Lady’s Power",
      body: "Oh, Immaculate Mary, Virgin most powerful, I beseech thee, through that immense power which thou hast received from the Eternal Father, obtain for me purity of heart, strength to overcome all the enemies of my soul, and the special favor I implore in my present necessity. [Name your prayer intention]\nMother most pure! Forsake me not, despise not my prayer, graciously hear me for God’s glory, thy honor, and the welfare of my soul.",
      closing: "To obtain this favor, I honor thy power by reciting: Hail Mary…" },
    { title: "In Honor of Our Lady’s Wisdom",
      body: "Oh Virgin Mary, my Mother, through that ineffable wisdom bestowed upon thee by the Incarnate Word of God, I humbly beseech thee, obtain for me meekness and humility of heart, a perfect knowledge of the Divine Will, and strength to accomplish it always.\nOh Mary, Seat of Wisdom, as a tender Mother, lead me in the path of Christian virtue and perfection; enlighten and enable me to do what is most pleasing to thy beloved Son, and obtain my petition.",
      closing: "To obtain this grace, I honor thy wisdom by reciting: Hail Mary…" },
    { title: "In Honor of Our Lady’s Mercy",
      body: "Oh, Mother of Mercy, Mother of penitent sinners, I stand before thee sinful and sorrowful, beseeching thee through the immense Love given to thee by the Holy Spirit for us poor sinners, obtain for me true and perfect contrition for my sins, which I hate and detest with all my heart, because I love God.\nMother most merciful, help me in my present necessity. Turn, then, those eyes of mercy toward us, oh clement, oh loving, oh sweet Virgin Mary!",
      closing: "To obtain this precious gift, I honor thy loving mercy by reciting: Hail Mary…" }
  ]
};
