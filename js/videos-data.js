/* ============================================================
   STILL WATERS — VIDEO LIBRARY
   ============================================================
   HOW TO ADD A NEW VIDEO (takes ~30 seconds):

   1. Find the YouTube video's ID. It's the part after "v=" or after
      "youtu.be/" in the link, and it stops at any "?" or "&":
        https://www.youtube.com/watch?v=7NnY1kp3OSE   → ID is 7NnY1kp3OSE
        https://youtu.be/7NnY1kp3OSE?si=abc123        → ID is 7NnY1kp3OSE

   2. Copy one of the blocks below (from "{" to "},") and paste it
      into the list you want — "christian" or "selfimprovement".
      The order here is the order shown on the page.

   3. Fill in:
        id:      the YouTube ID from step 1 (in quotes)
        title:   the video's title
        speaker: who is speaking (shown under the title)
        note:    optional one-line description (or leave as "")

   4. Save the file, upload it to GitHub replacing js/videos-data.js,
      and commit. Done — the new video card appears automatically.

   Example of a new entry ready to paste:
      { id: "XXXXXXXXXXX", title: "My New Talk", speaker: "Speaker Name", note: "" },
   ============================================================ */

const VIDEOS = {
  christian: [
    { id: "7NnY1kp3OSE", title: "Be Not Afraid", speaker: "Bishop Robert Barron", note: "Sunday Sermon" },
    { id: "tIMUWGpw66U", title: "You Need God", speaker: "Sr. Miriam James Heidland, SOLT", note: "SEEK26" },
    { id: "EpQJyaAz4gU", title: "What Do You Still Lack?", speaker: "Sr. Miriam James Heidland, SOLT", note: "SEEK25" },
    { id: "6bDzXBgb2_A", title: "A Powerful Rosary Testimony", speaker: "T.K. Coleman", note: "" },
    { id: "RHO8L9477aU", title: "Every Scientifically Proven Eucharistic Miracle", speaker: "", note: "" },
    { id: "VCts0fjsmug", title: "On Taking the Discipline", speaker: "Bishop Robert Barron", note: "" },
    { id: "frcI6OD0IbY", title: "Are You Anxious and Worried About Many Things?", speaker: "Bishop Robert Barron", note: "Sunday Sermon" },
    { id: "Mm9MaX_8Z24", title: "Listening, Humility, and Unity", speaker: "Pope Leo XIV", note: "Homily · September 1, 2025" },
    { id: "VwCtggPcI9g", title: "“Do Not Give Up”", speaker: "Biblical Motivation", note: "" },
    { id: "Dn-1j5QWsAM", title: "Seek God’s Plan", speaker: "Nick Vujicic", note: "" }
  ],

  selfimprovement: [
    { id: "-ki9-oaPwHs", title: "How to Believe in Yourself", speaker: "Jim Cathcart", note: "TEDxDelrayBeach" },
    { id: "1XDpa2HLXV0", title: "Beautiful Minds Are Free from Fear", speaker: "Robert Grant", note: "TEDxOrangeCoast" },
    { id: "SbyCtcvLRh8", title: "Become the Person You Can’t Imagine", speaker: "Norman Bacal", note: "TEDxRyersonU" },
    { id: "YiQQ1EWMFHg", title: "Mindset Is More Important Than Strategy", speaker: "Preston Pugmire", note: "TEDxRexburg" },
    { id: "xF80HzqvAoA", title: "The Art of Focus — a Crucial Ability", speaker: "Christina Bengtsson", note: "TEDxGöteborg" },
    { id: "PBaFURjVrm0", title: "How to Hack Your Brain for Better Focus", speaker: "Sasha Hamdani", note: "TEDxKC" },
    { id: "Lp7E973zozc", title: "How to Stop Screwing Yourself Over", speaker: "Mel Robbins", note: "TEDxSF" },
    { id: "pxBQLFLei70", title: "Make Your Bed — 2014 Commencement Address", speaker: "Admiral William H. McRaven", note: "University of Texas at Austin" },
    { id: "CzII3W2MLYY", title: "Inspirational Speech", speaker: "Barack Obama", note: "" },
    { id: "pqWUuYTcG-o", title: "2024 Commencement Address at Dartmouth", speaker: "Roger Federer", note: "Dartmouth College" },
    { id: "BAswj8evFZk", title: "How Ethics Can Help You Make Better Decisions", speaker: "Michael Schur ", note: "TEDxVancouver" },
    { id: "8GQZuzIdeQQ", title: "How to make hard choices ", speaker: "Ruth Chang", note: "TEDxNewYork" },
    { id: "JD4Fhh6GDcY", title: "A philosopher’s argument against the cult of achievement", speaker: "Zena Hitz", note: "Big Think" },
    { id: "7vVIkdn_ljs", title: "My Time Will Come ", speaker: "Ian Manuel", note: "Perception Box" },
    { id: "0barY2A6dpU", title: "Discipline sets creativity free", speaker: "David Epstein", note: "Big Think" },
    { id: "kz-I5zIGbj4", title: "Why I Love My Bad Days", speaker: "Alexi Pappas", note: "TED" },
    { id: "xSBGYoS6z68", title: "Thinkers vs. Do-ers: Why You Suck At Following Through", speaker: "HealthyGamerGG", note: "Dr.K" },
    { id: "fxbCHn6gE3U", title: "The surprising habits of original thinkers", speaker: "Adam Grant", note: "TEDxVancouver" },
    { id: "N7wF2AdVy2Q", title: "How frustration can make us more creative", speaker: "Tim Harford", note: "TEDxLondon" },
    { id: "bavZbQHbuOk", title: "When you are feeling down", speaker: "Shuzo Matsuoka", note: "Japanese David Goggins" },
    { id: "xDtK6wr-d_Q", title: " Akio Toyoda MBA’82 at Babson’s Centennial Commencement", speaker: "Akio Toyoda", note: "Babson College" },
    { id: "TQMbvJNRpLE", title: " How to Achieve Your Most Ambitious Goals ", speaker: "Stephen Duneier", note: "TedxTucson" },
    { id: "rNxC16mlO60", title: " The Secrets and Science of Mental Toughness", speaker: "Joe Risser MD, MPH ", note: "TEDxSanDiego" },
    { id: "v1ojZKWfShQ", title: " How To Eliminate Self Doubt Forever & The Power of Your Unconscious Mind", speaker: "Peter Sage", note: "TEDxPatras"},
    { id: "pN34FNbOKXc", title: " The Power of belief -- mindset and success ", speaker: "Eduardo Briceno", note: "TEDxManhattanBeach"},
    { id: "UPoTsudFF4Y", title: " The Hidden Code For Transforming Dreams Into Reality ", speaker: "Mary Morrissey", note: "TEDxWilmingtonWomen"},
    { id: "21j_OCNLuYg", title: " Life is easy. Why do we make it so hard? ", speaker: "Jon Jandaiy", note: "TEDxDoiSuthep"},
    { id: "36m1o-tM05g", title: " My philosophy for a happy life ", speaker: "Sam Berns", note: "TEDxMidAtlantic"},
    { id: "w-HYZv6HzAs", title: " The skill of self confidence ", speaker: "Dr. Ivan Joseph ", note: " TEDxRyersonU"},
    { id: "I4svF7J6MWg", title: "How to Become Your Best When Life Gives You Its Worst ", speaker: "Peter Sage ", note: "TEDxKlagenfurt"},
    { id: "xkd36cJ6Z78", title: " Why You're Struggling With Discipline ", speaker: "Alok Kanojia", note: "HealthyGG"},
    { id: "y0tVnE-8mwU", title: " How to be socially magnetic ", speaker: "Ben Chai", note: "TEDxSurreyUniversity"},
    { id: "jpRqbP9Nv9k", title: "A guide to believing in yourself (but for real this time) ", speaker: "Catherine Reitman", note: "TEDXToronto"},
    { id: "NWH8N-BvhAw", title: "The three secrets of resilient people", speaker: "Lucy Hone", note: "TEDxChristchurch"},
    { id: "u8OySa4uZmU", title: "10 Minutes for the next 10 Years", speaker: "Matthew McConaughey", note: "10 minute video"},
    { id: "bbz2boNSeL0", title: "Beautiful Speech from a Sri Lankan Guy", speaker: "Dananjaya Hettiarachchi", note: "World Champion of Public Speaking 2014"},
    { id: "7Tev43VNRIc", title: "Still Standing", speaker: "Ramona J. Smith", note: "2018 Toastmasters World Champion of Public Speaking"},
    { id: "UtBsl3j0YRQ", title: "Want to be happy? Be grateful", speaker: "David Steindl-Rast", note: "TEDXEdinburgh"},
    { id: "BxY_eJLBflk", title: "Put God First", speaker: "Denzel Washington", note: "Dillard University"},
    { id: "9igSh9IwMAc", title: "The Apollo Story ", speaker: "Steve Harvey", note: "Motivated +"},
    { id: "WKroVMnxnMI", title: "Ask, Believe, Work ", speaker: "Steve Harvey", note: "Motivated +"},
    { id: "GMWFieBGR7c", title: "Oprah Winfrey Harvard Commencement speech", speaker: "Oprah Winfrey", note: "Harvard University"},
    { id: "wupToqz1e2g", title: "Pale Blue Dot", speaker: "Carl Sagan", note: "The Magical Speech"},
    { id: "cRmbwczTC6E", title: "Beauty", speaker: "Richard Feynman", note: "Feynman Series"},
    { id: "o8GA2w-qrcg", title: "Humility", speaker: "Carl Sagan", note: "The Planets, BBC"},
    { id: "9D05ej8u-gU", title: "The Most Astounding Fact", speaker: "Neil deGrasse Tyson", note: "TIME Magazine"},
    { id: "CbIZU8cQWXc", title: "We Stopped Dreaming", speaker: "Neil deGrasse Tyson", note: ""},
    { id: "bAX27XRHMH8", title: "There's no such thing as MIRACLE", speaker: "Richard Feynman ", note: "Feynman Series"}
  ]
};
