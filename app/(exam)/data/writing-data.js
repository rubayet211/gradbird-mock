/**
 * IELTS Academic Writing Test Data
 * Externalized task prompts and configuration
 */

export const WRITING_EXAM_DATA = {
    title: "IELTS Academic Writing Test",
    totalTime: 60, // minutes
    tasks: [
        {
            id: 'task-1',
            taskNumber: 1,
            title: 'Academic Writing Task 1',
            time: '20 minutes',
            minWords: 150,
            instructions: `You should spend about 20 minutes on this task.

The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
            hasChart: true,
            chartType: 'bar',
            chartImageUrl: null, // Set to image path when available, e.g., '/images/writing/task1-chart.png'
            chartDescription: 'Bar chart showing housing ownership vs renting trends from 1918-2011'
        },
        {
            id: 'task-2',
            taskNumber: 2,
            title: 'Academic Writing Task 2',
            time: '40 minutes',
            minWords: 250,
            instructions: `You should spend about 40 minutes on this task.

Write about the following topic:

Some people believe that unpaid community service should be a compulsory part of high school programmes (for example, working for a charity, improving the neighbourhood or teaching sports to younger children).

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
            hasChart: false,
            chartType: null,
            chartImageUrl: null,
            chartDescription: null
        }
    ]
};

/**
 * Get a specific task by task number
 * @param {number} taskNumber - 1 or 2
 * @returns {Object|undefined} The task data or undefined
 */
export function getTaskByNumber(taskNumber) {
    return WRITING_EXAM_DATA.tasks.find(t => t.taskNumber === taskNumber);
}

/**
 * Get all tasks
 * @returns {Array} Array of task objects
 */
export function getAllTasks() {
    return WRITING_EXAM_DATA.tasks;
}
