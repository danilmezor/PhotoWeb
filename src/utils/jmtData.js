const rawJmtData = [
    {
        id: 1,
        day: "Day 1",
        title: "Whitney Portal - The Beginning",
        text: "June 29th, 2025, 9:12 AM. Whitney Portal sits at 8,360 feet, the eastern gateway to Mount Whitney. I met two other hikers and we began our ascent together, starting the climb that would gain over 6,100 feet in just 11 miles.",
        imageCount: 2,
    },
    {
        id: 2,
        day: "Day 1",
        title: "Climbing Through Pine Forests",
        text: "The trail wasted no time gaining elevation through dense pine forests. Each switchback revealed the valley below shrinking beneath us. The Whitney Trail is one of the most dramatic elevation gains on the entire JMT - relentless but beautiful.",
        imageCount: 2,
    },
    {
        id: 3,
        day: "Day 1",
        title: "Trail Camp - 12,000 Feet",
        text: "Seven hours later, we reached Trail Camp at 12,000 feet. The stark alpine bowl sits beneath towering granite walls, our final stop before the summit push. Tomorrow morning, the famous 99 switchbacks await us in the pre-dawn darkness.",
        imageCount: 3,
    },
    {
        id: 4,
        day: "Day 2",
        title: "The 99 Switchbacks",
        text: "Alpine start at 4:00 AM, headlamps cutting through darkness. The 99 switchbacks carved into the mountainside like a staircase to the sky. At 13,500 feet, we reached Trail Crest and saw the western Sierra for the first time - an endless sea of peaks.",
        imageCount: 2,
    },
    {
        id: 5,
        day: "Day 2",
        title: "Whitney Summit - Mile Zero",
        text: "14,505 feet - the highest point in the lower 48 states. I signed the summit register and took in the view, but this wasn't my destination. This was mile zero of my 211-mile journey to Yosemite, and I had to say goodbye to my friends and descend west alone.",
        imageCount: 2,
    },
    {
        id: 6,
        day: "Day 2",
        title: "Descent to Timberlane Lake",
        text: "The western descent was a revelation - dropping 3,000 feet through Guitar Lake basin. The landscape transformed from barren alpine to lush meadows dotted with lakes. My knees ached, but the real adventure had finally begun.",
        imageCount: 2,
    },
    {
        id: 7,
        day: "Day 3",
        title: "Approaching Forester Pass",
        text: "The JMT crosses seven major passes, each above 11,000 feet. Forester Pass, at 13,153 feet, is the highest point on the entire trail.",
        imageCount: 1,
    },
    {
        id: 8,
        day: "Day 3",
        title: "Forester Pass Summit",
        text: "Steep switchbacks carved into an impossible granite wall led to a narrow notch in the ridge. This marks the boundary between Sequoia and Kings Canyon National Parks. Jagged peaks stretched in every direction - the kind of view that makes you feel both insignificant and deeply alive.",
        imageCount: 3,
    },
    {
        id: 9,
        day: "Day 3",
        title: "First Storm",
        text: "The Sierra humbled me just when I got comfortable. Dark clouds rolled in, thunder echoed off granite, and within minutes hail pounded down like tiny white marbles. I learned a crucial lesson: in the high Sierra, weather can change in a heartbeat.",
        imageCount: 2,
    },
    {
        id: 10,
        day: "Day 4",
        title: "Kearsarge Pass Trail Junction",
        text: "On the next day after the hailstorm, I reached the junction for Kearsarge Pass - a popular resupply point 7 miles off the JMT. Most hikers take a zero day in the nearby town, but I needed to get my supplies and return to the trail the same day. The detour climbs to 11,760 feet before descending to Onion Valley.",
        imageCount: 2,
    },
    {
        id: 11,
        day: "Day 5",
        title: "Kearsarge Lakes",
        text: "On the return to the JMT, I camped at Kearsarge Lakes - one of my favorite spots in the high Sierra. The basin sits in pristine alpine terrain with crystal clear water reflecting the surrounding peaks.",
        imageCount: 2,
    },
    {
        id: 13,
        day: "Day 5",
        title: "Meeting Robert at Mirror Lake",
        text: "Just before reaching my planned camp spot, I met Robert. We started a conversation that would last the next 2 weeks - from that day forward, we hiked together until the very end. Sometimes the trail gives you exactly what you need at exactly the right moment.",
        imageCount: 5,
    },
    {
        id: 14,
        day: "Day 6",
        title: "Climbing to Muir Pass",
        text: "At 11,955 feet, Muir Pass is home to the historic Muir Hut, built in 1930 as an emergency shelter.",
        imageCount: 2,
    },
    {
        id: 15,
        day: "Day 6",
        title: "The International Dream Team",
        text: "At Muir Pass, we joined a group of PCT hikers from around the world - America, Europe, Japan, and beyond. We shared stories, food, and laughter at 12,000 feet. I started to realize that this trail was about more than just the mountains - it was about the connections we make on this journey.",
        imageCount: 3,
    },
    {
        id: 16,
        day: "Day 6",
        title: "Evolution Basin",
        text: "Descending from Muir Pass into Evolution Basin felt like entering another world. Named by Theodore Solomons for Darwin, Huxley, Spencer, and other evolution theorists, these peaks tower over sapphire lakes. The golden hour light painted everything in impossible colors.",
        imageCount: 3,
    },
    {
        id: 17,
        day: "Day 7",
        title: "VVR - A Zero Day",
        text: "Vermilion Valley Resort (VVR) is a backcountry oasis accessible only by boat, trail, or floatplane. After nearly two weeks of hiking, our group decided to take a zero day - hiker terminology for a day with zero miles hiked. We needed to rest our bodies and enjoy each other's company away from the demands of the trail.",
        imageCount: 2,
    },
    {
        id: 18,
        day: "Day 7",
        title: "Rest and Recovery",
        text: "We ate real food, took actual showers, and swapped stories with other hikers. The break reminded us why we were out here. Tomorrow, we'd return to the trail refreshed and ready for the rest of our journey.",
        imageCount: 2,
    },
    {
        id: 19,
        day: "Day 8",
        title: "The March to Lake Virginia",
        text: "Back on the trail, something had shifted. Our bodies had adapted to the elevation and the daily grind. The packs that once felt crushing now felt manageable. Everyone in our group knew we were going to finish - it was no longer a question of if, but when.",
        imageCount: 3,
    },
    {
        id: 20,
        day: "Day 8",
        title: "Finding Our Rhythm",
        text: "The trail no longer challenged us the way it once did. Instead, it felt like home. We hiked through Purple Lake, past Cascade Valley, knowing every stream crossing and every climb. Lake Virginia sat at 10,314 feet, surrounded by volcanic peaks that glowed red in the evening light.",
        imageCount: 2,
    },
    {
        id: 21,
        day: "Day 9",
        title: "Reds Meadow - Final Resupply",
        text: "Reds Meadow is the last resupply point before Yosemite, just 5 miles off the JMT via a steep descent. We picked up our final food caches and ate fresh burgers at the cafe. The end was within reach - just 40 miles and two more days to go.",
        imageCount: 2,
    },
    {
        id: 22,
        day: "Day 9",
        title: "Ansel Adams Wilderness",
        text: "We climbed back to the trail and entered Ansel Adams Wilderness, named for the legendary photographer. The landscape here is gentler than the high passes - rolling terrain dotted with lakes and forests. We found a perfect campsite away from other hikers, eager to watch the stars that night.",
        imageCount: 2,
    },
    {
        id: 23,
        day: "Day 10",
        title: "Entering Yosemite",
        text: "Crossing into Yosemite National Park felt monumental. The landscape took on an almost sacred quality - dramatic granite domes, cascading waterfalls, and ancient forests. This is where the Pacific Crest Trail continues north and the John Muir Trail reaches its terminus.",
        imageCount: 2,
    },
    {
        id: 24,
        day: "Day 10",
        title: "Lyell Canyon",
        text: "Lyell Canyon is a gentle, meandering stretch through meadows along the Lyell Fork of the Tuolumne River. After days of climbing passes, the flat terrain felt surreal. We walked slowly, savoring each moment, knowing our journey was nearly complete.",
        imageCount: 2,
    },
    {
        id: 25,
        day: "Day 10",
        title: "The Final Miles",
        text: "The last miles to Happy Isles in Yosemite Valley passed in a blur of emotions. We descended through forests, crossed bridges over rushing water, and felt civilization creeping back in. After 211 miles and 21 days, me and Robert walked those final steps together, united by something deeper than just a shared trail.",
        imageCount: 3,
    },
];

const jmtImagePaths = [
    "_DSC1510.jpg",
    "_DSC1514.jpg",
    "_DSC1529.jpg",
    "_DSC1535-Edit.jpg",
    "_DSC1554.jpg",
    "_DSC1562.jpg",
    "_DSC1581.jpg",
    "_DSC1583.jpg",
    "_DSC1616.jpg",
    "_DSC1636.jpg",
    "_DSC1648.jpg",
    "_DSC1804.jpg",
    "_DSC1827.jpg",
    "_DSC1865.jpg",
    "_DSC1878-Edit.jpg",
    "_DSC1939.jpg",
    "_DSC2021.jpg",
    "_DSC2074.jpg",
    "_DSC2137.jpg",
    "_DSC2304.jpg",
    "_DSC2446.jpg",
    "_DSC2779.jpg",
    "_DSC2799.jpg",
    "_DSC2810.jpg",
    "_DSC2813-HDR.jpg",
    "_DSC2848.jpg",
    "_DSC2907.jpg",
    "_DSC2975-HDR.jpg",
    "_DSC3065.jpg",
    "_DSC3111.jpg",
    "_DSC3151-HDR.jpg",
    "_DSC3155.jpg",
    "_DSC3166.jpg",
    "_DSC3257.jpg",
    "_DSC3272-HDR.jpg",
    "_DSC3370.jpg",
    "_DSC3446-Enhanced-NR.jpg",
    "_DSC3457.jpg",
    "_DSC3592.jpg",
    "_DSC3649-HDR.jpg",
    "_DSC3751.jpg",
    "_DSC3788-Enhanced-NR.jpg",
    "_DSC3804-Edit.jpg",
    "_DSC3832.jpg",
    "_DSC3921-HDR.jpg",
    "_DSC4039.jpg",
    "_DSC4063-Enhanced-NR.jpg"
].map(
    (fileName) => `/photos/JMT/${encodeURIComponent(fileName)}`
);

const assignedImageCounts = (() => {
    const dayCount = rawJmtData.length;
    const desiredCounts = rawJmtData.map((day) => Math.max(day.imageCount, 1));
    const assignedCounts = new Array(dayCount).fill(1);

    let remaining = Math.max(jmtImagePaths.length - dayCount, 0);

    for (let i = 0; i < dayCount && remaining > 0; i += 1) {
        const extraNeeded = Math.max(desiredCounts[i] - 1, 0);
        const extraAssigned = Math.min(extraNeeded, remaining);
        assignedCounts[i] += extraAssigned;
        remaining -= extraAssigned;
    }

    let index = 0;
    while (remaining > 0) {
        assignedCounts[index % dayCount] += 1;
        remaining -= 1;
        index += 1;
    }

    return assignedCounts;
})();

let imageCursor = 0;

export const jmtData = rawJmtData.map((day, index) => {
    const count = assignedImageCounts[index] || 1;
    const images = jmtImagePaths.slice(imageCursor, imageCursor + count);
    imageCursor += count;

    const { imageCount: _imageCount, ...rest } = day;

    return {
        ...rest,
        images,
    };
});
