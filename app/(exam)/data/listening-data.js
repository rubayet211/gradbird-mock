/**
 * IELTS Listening Exam Data
 * 4 Parts with mixed question types
 * Part 1: Conversation - Gap Fill
 * Part 2: Monologue with Map - Map Labeling
 * Part 3: Discussion - Matching
 * Part 4: Lecture - MCQ + Short Answer
 */

export const LISTENING_EXAM_DATA = {
    title: "IELTS Listening Test",
    parts: [
        {
            id: 'part-1',
            partNumber: 1,
            title: 'Part 1: A Conversation About Booking a Hotel',
            audioUrl: '',
            transcript: `Agent: Good morning, Sunshine Hotels, how can I help you today?
Customer: Hi, I'd like to book a room for next weekend please.
Agent: Certainly. Which dates are you looking at?
Customer: Friday the 15th to Sunday the 17th.
Agent: That's two nights. And what type of room would you prefer?
Customer: A double room, please. With a sea view if possible.
Agent: Let me check availability... Yes, we have a double room with sea view available. The rate is £95 per night.
Customer: That sounds fine. Can I book it?
Agent: Of course. Can I take your name please?
Customer: It's Elizabeth Parker.
Agent: And your contact number?
Customer: 07845 332109.
Agent: Perfect. Your booking reference is HP2847. You'll receive confirmation by email.`,
            questions: [
                {
                    type: 'GapFill',
                    heading: 'Questions 1-5',
                    startId: 1,
                    instruction: 'Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
                    data: {
                        id: 'gf-p1',
                        questions: [
                            { id: 1, text: 'Dates: Friday 15th to ____ 17th', wordLimit: 1 },
                            { id: 2, text: 'Number of nights: ____', wordLimit: 1 },
                            { id: 3, text: 'Room type: ____ room with sea view', wordLimit: 1 },
                            { id: 4, text: 'Price per night: £____', wordLimit: 1 },
                            { id: 5, text: 'Booking reference: ____', wordLimit: 1 },
                        ]
                    }
                },
                {
                    type: 'GapFill',
                    heading: 'Questions 6-10',
                    startId: 6,
                    instruction: 'Complete the form below. Write NO MORE THAN THREE WORDS for each answer.',
                    data: {
                        id: 'gf-p1-2',
                        questions: [
                            { id: 6, text: 'Guest name: ____ Parker', wordLimit: 1 },
                            { id: 7, text: 'Contact number: ____', wordLimit: 1 },
                            { id: 8, text: 'Confirmation sent by: ____', wordLimit: 1 },
                            { id: 9, text: 'Hotel name: ____ Hotels', wordLimit: 1 },
                            { id: 10, text: 'Room feature requested: ____ view', wordLimit: 1 },
                        ]
                    }
                }
            ]
        },
        {
            id: 'part-2',
            partNumber: 2,
            title: 'Part 2: Tour of the University Library',
            audioUrl: '',
            transcript: `Welcome to the university library orientation. I'm going to give you a brief tour of our facilities today. 

As you enter through the main entrance, you'll see the information desk directly in front of you. To your left is the computer lab, which has 50 workstations available for student use. 

Moving past the information desk, you'll find the periodicals section on your right, where we keep all current magazines and newspapers. The reference section is located at the back of the ground floor.

If you take the stairs up to the first floor, you'll find our quiet study area on the left side. This is a silent zone, so please respect other students. On the right side of the first floor, we have the group study rooms, which can be booked in advance.

The café is located on the ground floor, next to the computer lab. It's open from 8am to 6pm during term time.`,
            questions: [
                {
                    type: 'MapLabeling',
                    heading: 'Questions 11-15',
                    startId: 11,
                    instruction: 'Label the map below. Drag the correct label to each numbered location.',
                    data: {
                        id: 'map-library',
                        imageUrl: '/images/library-map.png', // Placeholder
                        dropZones: [
                            { id: 'zone-11', x: 15, y: 25, questionId: 11 },
                            { id: 'zone-12', x: 75, y: 25, questionId: 12 },
                            { id: 'zone-13', x: 50, y: 70, questionId: 13 },
                            { id: 'zone-14', x: 20, y: 55, questionId: 14 },
                            { id: 'zone-15', x: 80, y: 55, questionId: 15 },
                        ],
                        labels: [
                            'Computer Lab',
                            'Periodicals Section',
                            'Reference Section',
                            'Café',
                            'Information Desk',
                            'Group Study Rooms',
                            'Quiet Study Area',
                        ]
                    }
                },
                {
                    type: 'TrueFalse',
                    heading: 'Questions 16-20',
                    startId: 16,
                    instruction: 'Do the following statements agree with the information given?',
                    items: [
                        { id: 16, text: 'The computer lab has more than 40 workstations.' },
                        { id: 17, text: 'Current newspapers are kept in the reference section.' },
                        { id: 18, text: 'The quiet study area is on the ground floor.' },
                        { id: 19, text: 'Group study rooms require advance booking.' },
                        { id: 20, text: 'The café is open until 8pm during term time.' },
                    ]
                }
            ]
        },
        {
            id: 'part-3',
            partNumber: 3,
            title: 'Part 3: Academic Discussion on Research Projects',
            audioUrl: '',
            transcript: `Tutor: So, let's discuss the progress on your group research project. Sarah, you're leading the team. How are things going?

Sarah: Well, Professor, we've divided the work among the three of us. I'm handling the literature review, and I've found some really interesting recent studies.

Tom: I've been working on the methodology section. I think we should use a mixed-methods approach combining surveys and interviews.

Sarah: That sounds good. What about the data analysis, Lucy?

Lucy: I'm planning to use SPSS for the quantitative data. For the qualitative part, I'll do thematic analysis.

Tutor: Good division of labor. What about the timeline?

Tom: We're aiming to complete data collection by the end of November. That gives us December to analyze and write up.

Sarah: And I'll compile everything for the final submission in January.`,
            questions: [
                {
                    type: 'Matching',
                    heading: 'Questions 21-25',
                    startId: 21,
                    instruction: 'Match each task with the person responsible.',
                    data: {
                        id: 'matching-p3',
                        items: [
                            { id: 'A', text: 'Literature review' },
                            { id: 'B', text: 'Methodology development' },
                            { id: 'C', text: 'Quantitative data analysis' },
                            { id: 'D', text: 'Thematic analysis' },
                            { id: 'E', text: 'Final compilation' },
                        ],
                        options: [
                            'Sarah',
                            'Tom',
                            'Lucy',
                            'Professor',
                            'Not mentioned',
                        ],
                    }
                },
                {
                    type: 'GapFill',
                    heading: 'Questions 26-30',
                    startId: 26,
                    instruction: 'Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.',
                    data: {
                        id: 'gf-p3',
                        questions: [
                            { id: 26, text: 'Research approach: ____ methods', wordLimit: 2 },
                            { id: 27, text: 'Data collection methods: surveys and ____', wordLimit: 1 },
                            { id: 28, text: 'Software for quantitative analysis: ____', wordLimit: 1 },
                            { id: 29, text: 'Data collection deadline: end of ____', wordLimit: 1 },
                            { id: 30, text: 'Final submission month: ____', wordLimit: 1 },
                        ]
                    }
                }
            ]
        },
        {
            id: 'part-4',
            partNumber: 4,
            title: 'Part 4: Lecture on Climate Change and Agriculture',
            audioUrl: '',
            transcript: `Today's lecture focuses on the impact of climate change on global agriculture. As temperatures rise, we're seeing significant shifts in growing seasons and crop yields worldwide.

Research shows that for every degree Celsius increase in global temperature, wheat yields decrease by approximately 6%. This has serious implications for food security, particularly in developing nations.

However, it's not all negative news. Some regions in higher latitudes may actually benefit from longer growing seasons. Canada and Russia, for instance, could see increased agricultural productivity.

Adaptation strategies are crucial. These include developing drought-resistant crop varieties, implementing water-efficient irrigation systems, and shifting to heat-tolerant livestock breeds.

The economic impact is substantial. The World Bank estimates that climate change could push an additional 100 million people into poverty by 2030, largely due to agricultural disruption.`,
            questions: [
                {
                    type: 'MCQ',
                    heading: 'Questions 31-35',
                    startId: 31,
                    instruction: 'Choose the correct letter, A, B, or C.',
                    items: [
                        {
                            id: 31,
                            text: 'According to the lecture, what happens to wheat yields with rising temperatures?',
                            options: [
                                'A. They increase by 6% per degree',
                                'B. They decrease by 6% per degree',
                                'C. They remain stable',
                            ]
                        },
                        {
                            id: 32,
                            text: 'Which regions may benefit from climate change?',
                            options: [
                                'A. Tropical regions',
                                'B. Coastal regions',
                                'C. Higher latitude regions',
                            ]
                        },
                        {
                            id: 33,
                            text: 'Which of the following is mentioned as an adaptation strategy?',
                            options: [
                                'A. Increased use of pesticides',
                                'B. Drought-resistant crop varieties',
                                'C. Expanding farmland',
                            ]
                        },
                        {
                            id: 34,
                            text: 'Who provided the poverty estimate mentioned in the lecture?',
                            options: [
                                'A. The United Nations',
                                'B. The World Bank',
                                'C. The World Health Organization',
                            ]
                        },
                        {
                            id: 35,
                            text: 'By what year could climate change push 100 million more people into poverty?',
                            options: [
                                'A. 2025',
                                'B. 2030',
                                'C. 2050',
                            ]
                        }
                    ]
                },
                {
                    type: 'ShortAnswer',
                    heading: 'Questions 36-40',
                    startId: 36,
                    instruction: 'Answer the questions below. Write NO MORE THAN THREE WORDS for each answer.',
                    data: {
                        id: 'sa-p4',
                        wordLimitDescription: 'Write NO MORE THAN THREE WORDS',
                        questions: [
                            { id: 36, text: 'What is the main topic of the lecture?', wordLimit: 3 },
                            { id: 37, text: 'Which crop was specifically mentioned regarding yield decrease?', wordLimit: 1 },
                            { id: 38, text: 'Name one country that may see increased agricultural productivity.', wordLimit: 1 },
                            { id: 39, text: 'What type of irrigation systems are mentioned as an adaptation strategy?', wordLimit: 2 },
                            { id: 40, text: 'What is the main concern for developing nations?', wordLimit: 2 },
                        ]
                    }
                }
            ]
        }
    ]
};

// Helper to get all question IDs for the footer navigation
export const getAllListeningQuestionIds = () => {
    const ids = [];
    LISTENING_EXAM_DATA.parts.forEach(part => {
        part.questions.forEach(questionBlock => {
            if (questionBlock.items) {
                questionBlock.items.forEach(item => ids.push(item.id));
            } else if (questionBlock.data?.questions) {
                questionBlock.data.questions.forEach(q => ids.push(q.id));
            } else if (questionBlock.data?.dropZones) {
                questionBlock.data.dropZones.forEach(zone => ids.push(zone.questionId));
            }
        });
    });
    return ids;
};
