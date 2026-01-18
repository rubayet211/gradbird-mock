export const KEYWORD_OPTIONS = [
    "Work", "Study", "Hometown", "Home", "Art", "Bicycles", "Birthdays", "Childhood",
    "Clothes", "Computers", "Daily Routine", "Dictionaries", "Dreams", "Drinks",
    "Family", "Flowers", "Food", "Friends", "Happiness", "Hobbies", "Internet",
    "Leisure Time", "Music", "Names", "Neighbors", "News", "Photography", "Reading",
    "Shopping", "Sports", "TV", "Transport", "Weather"
];

export const SPEAKING_DATA = {
    part1: {
        title: "Part 1: Introduction & Interview",
        duration: "4-5 minutes",
        description: "In this part, the examiner will introduce themselves and check your ID. They will then ask you general questions on some familiar topics such as home, family, work, studies and interests.",
        interviewTopics: [
            {
                topic: "Work/Study",
                questions: [
                    "Do you work or are you a student?",
                    "What do you do?",
                    "Do you enjoy your work/studies?",
                    "Why did you choose this job/subject?"
                ]
            },
            {
                topic: "Hometown",
                questions: [
                    "Where are you from?",
                    "What do you like about your hometown?",
                    "Is there anything you would like to change about your hometown?",
                    "Would you say it's a good place to grow up?"
                ]
            }
        ]
    },
    part2: {
        title: "Part 2: Long Turn",
        duration: "3-4 minutes",
        preparationTime: 60, // seconds
        speakingTime: 120, // seconds
        description: "You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.",
        cueCard: {
            topic: "Describe a time when you helped someone.",
            prompts: [
                "Who you helped",
                "Why you helped them",
                "How you helped them",
                "And explain how you felt about helping them."
            ]
        }
    },
    part3: {
        title: "Part 3: Discussion",
        duration: "4-5 minutes",
        description: "You have been talking about a time when you helped someone. Now, I would like to ask you some more general questions related to this.",
        discussionTopics: [
            {
                topic: "Helping others in society",
                questions: [
                    "Do people today help others more or less than in the past?",
                    "Why should we help people we don't know?",
                    "How can we encourage children to help others?"
                ]
            },
            {
                topic: "Volunteering",
                questions: [
                    "What are the benefits of volunteering?",
                    "Should volunteering be mandatory for students?",
                    "What kinds of volunteer work are popular in your country?"
                ]
            }
        ]
    }
};
