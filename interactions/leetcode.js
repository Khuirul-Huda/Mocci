const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

// Sample LeetCode problems (since API requires GraphQL and authentication)
const PROBLEMS = [
    { id: '1', title: 'Two Sum', difficulty: 'Easy', link: 'https://leetcode.com/problems/two-sum/' },
    { id: '2', title: 'Add Two Numbers', difficulty: 'Medium', link: 'https://leetcode.com/problems/add-two-numbers/' },
    { id: '3', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
    { id: '4', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
    { id: '5', title: 'Longest Palindromic Substring', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-palindromic-substring/' },
    { id: '15', title: '3Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/3sum/' },
    { id: '20', title: 'Valid Parentheses', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-parentheses/' },
    { id: '21', title: 'Merge Two Sorted Lists', difficulty: 'Easy', link: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
    { id: '23', title: 'Merge k Sorted Lists', difficulty: 'Hard', link: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
    { id: '42', title: 'Trapping Rain Water', difficulty: 'Hard', link: 'https://leetcode.com/problems/trapping-rain-water/' },
    { id: '53', title: 'Maximum Subarray', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-subarray/' },
    { id: '70', title: 'Climbing Stairs', difficulty: 'Easy', link: 'https://leetcode.com/problems/climbing-stairs/' },
    { id: '121', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
    { id: '125', title: 'Valid Palindrome', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-palindrome/' },
    { id: '141', title: 'Linked List Cycle', difficulty: 'Easy', link: 'https://leetcode.com/problems/linked-list-cycle/' },
    { id: '200', title: 'Number of Islands', difficulty: 'Medium', link: 'https://leetcode.com/problems/number-of-islands/' },
    { id: '206', title: 'Reverse Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-linked-list/' },
    { id: '226', title: 'Invert Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/invert-binary-tree/' },
    { id: '238', title: 'Product of Array Except Self', difficulty: 'Medium', link: 'https://leetcode.com/problems/product-of-array-except-self/' },
    { id: '300', title: 'Longest Increasing Subsequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-increasing-subsequence/' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leetcode')
        .setDescription('Get a random LeetCode problem')
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('Problem difficulty')
                .setRequired(false)
                .addChoices(
                    { name: 'Easy', value: 'Easy' },
                    { name: 'Medium', value: 'Medium' },
                    { name: 'Hard', value: 'Hard' }
                )
        ),
    async execute(interaction) {
        try {
            const difficulty = interaction.options.getString('difficulty');

            let filteredProblems = PROBLEMS;
            if (difficulty) {
                filteredProblems = PROBLEMS.filter(p => p.difficulty === difficulty);
            }

            const problem = filteredProblems[Math.floor(Math.random() * filteredProblems.length)];

            const difficultyColors = {
                'Easy': 0x00FF00,
                'Medium': 0xFFA500,
                'Hard': 0xFF0000
            };

            const embed = new EmbedBuilder()
                .setTitle(`🧩 ${problem.title}`)
                .setURL(problem.link)
                .setDescription(`Try solving this ${problem.difficulty} problem on LeetCode!`)
                .addFields(
                    { name: 'Difficulty', value: problem.difficulty, inline: true },
                    { name: 'Problem ID', value: `#${problem.id}`, inline: true }
                )
                .setColor(difficultyColors[problem.difficulty])
                .setFooter({ text: 'Good luck! 💪' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            await interaction.reply({ content: `Error: ${error.message}`, flags: 1 << 6 });
        }
    }
};
