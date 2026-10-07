import type { ProblemDef } from "./types";

export const mediumProblems: ProblemDef[] = [
  {
    id: 3,
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"],
    acceptance: 36.9,
    description: ["Given a string `s`, find the length of the longest substring without repeating characters."],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
    hints: ["Keep a window [left, right] and a map from character to its last seen index."],
    functionName: "lengthOfLongestSubstring",
    signature: [["s", "string"]],
    returns: "number",
    reference: `function lengthOfLongestSubstring(s) {
  const last = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (last.has(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
    last.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
    examples: [
      [["abcabcbb"], 3, 'The answer is "abc", with the length of 3.'],
      [["bbbbb"], 1, 'The answer is "b", with the length of 1.'],
      [["pwwkew"], 3, 'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.'],
    ],
    hidden: [[""], [" "], ["dvdf"], ["abba"], ["au"], ["abcdefghijklmnopqrstuvwxyz".repeat(1_900)]],
  },
  {
    id: 11,
    slug: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Greedy"],
    acceptance: 55.0,
    description: [
      "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`th line are `(i, 0)` and `(i, height[i])`.",
      "Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
      "Notice that you may not slant the container.",
    ],
    constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
    hints: ["Start with the widest container and move the pointer at the shorter line inward."],
    functionName: "maxArea",
    signature: [["height", "number[]"]],
    returns: "number",
    reference: `function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
    if (height[l] < height[r]) l++; else r--;
  }
  return best;
}`,
    examples: [
      [[[1, 8, 6, 2, 5, 4, 8, 3, 7]], 49, "The max area of water the container can contain is 49 (between the lines of height 8 and 7)."],
      [[[1, 1]], 1],
      [[[4, 3, 2, 1, 4]], 16],
    ],
    hidden: [
      [[1, 2, 1]],
      [[0, 0]],
      [[2, 3, 4, 5, 18, 17, 6]],
      [Array.from({ length: 60_000 }, (_, i) => ((i * 7919) % 10_007) + 1)],
    ],
  },
  {
    id: 15,
    slug: "3sum",
    title: "3Sum",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Sorting"],
    acceptance: 36.2,
    description: [
      "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.",
      "Notice that the solution set must not contain duplicate triplets. The order of the triplets (and the order inside each triplet) does not matter.",
    ],
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    hints: ["Sort the array, fix the first number, then use two pointers for the remaining pair. Skip duplicates."],
    functionName: "threeSum",
    signature: [["nums", "number[]"]],
    returns: "number[][]",
    compare: "unordered",
    reference: `function threeSum(nums) {
  const a = nums.slice().sort((x, y) => x - y);
  const res = [];
  for (let i = 0; i < a.length - 2; i++) {
    if (a[i] > 0) break;
    if (i > 0 && a[i] === a[i - 1]) continue;
    let l = i + 1, r = a.length - 1;
    while (l < r) {
      const sum = a[i] + a[l] + a[r];
      if (sum < 0) l++;
      else if (sum > 0) r--;
      else {
        res.push([a[i], a[l], a[r]]);
        while (l < r && a[l] === a[l + 1]) l++;
        while (l < r && a[r] === a[r - 1]) r--;
        l++; r--;
      }
    }
  }
  return res;
}`,
    examples: [
      [[[-1, 0, 1, 2, -1, -4]], [[-1, -1, 2], [-1, 0, 1]], "The distinct triplets are [-1,0,1] and [-1,-1,2]."],
      [[[0, 1, 1]], [], "The only possible triplet does not sum up to 0."],
      [[[0, 0, 0]], [[0, 0, 0]], "The only possible triplet sums up to 0."],
    ],
    hidden: [
      [[-2, 0, 1, 1, 2]],
      [[-4, -2, -2, -2, 0, 1, 2, 2, 2, 3, 3, 4, 4, 6, 6]],
      [[1, 2, 3, 4]],
      [Array.from({ length: 3_000 }, () => 0)],
    ],
  },
  {
    id: 49,
    slug: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    tags: ["Array", "Hash Table", "String", "Sorting"],
    acceptance: 70.1,
    description: [
      "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
      "An anagram is a word formed by rearranging the letters of another word, using all the original letters exactly once.",
    ],
    constraints: [
      "1 <= strs.length <= 10^4",
      "0 <= strs[i].length <= 100",
      "strs[i] consists of lowercase English letters.",
    ],
    hints: ["Two words are anagrams if their sorted letters match. Use that as a map key."],
    functionName: "groupAnagrams",
    signature: [["strs", "string[]"]],
    returns: "string[][]",
    compare: "unordered",
    reference: `function groupAnagrams(strs) {
  const groups = new Map();
  for (const s of strs) {
    const key = s.split("").sort().join("");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.values()];
}`,
    examples: [
      [[["eat", "tea", "tan", "ate", "nat", "bat"]], [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]],
      [[[""]], [[""]]],
      [[["a"]], [["a"]]],
    ],
    hidden: [
      [["abc", "bca", "cab", "xyz", "zyx", "q"]],
      [["", ""]],
      [["ab", "ba", "ab", "ab"]],
      [Array.from({ length: 5_000 }, (_, i) => String.fromCharCode(97 + (i % 26)).repeat((i % 5) + 1))],
    ],
  },
  {
    id: 53,
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    acceptance: 50.8,
    description: [
      "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    hints: ["Kadane's algorithm: at each element decide whether to extend the current subarray or start a new one."],
    functionName: "maxSubArray",
    signature: [["nums", "number[]"]],
    returns: "number",
    reference: `function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
    examples: [
      [[[-2, 1, -3, 4, -1, 2, 1, -5, 4]], 6, "The subarray [4,-1,2,1] has the largest sum 6."],
      [[[1]], 1, "The subarray [1] has the largest sum 1."],
      [[[5, 4, -1, 7, 8]], 23, "The subarray [5,4,-1,7,8] has the largest sum 23."],
    ],
    hidden: [
      [[-1]],
      [[-2, -1]],
      [[-3, -2, -1]],
      [[8, -19, 5, -4, 20]],
      [Array.from({ length: 60_000 }, (_, i) => (i % 7) - 3)],
    ],
  },
  {
    id: 56,
    slug: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    tags: ["Array", "Sorting"],
    acceptance: 46.7,
    description: [
      "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
      "Return the merged intervals sorted by start.",
    ],
    constraints: ["1 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= start_i <= end_i <= 10^4"],
    hints: ["Sort by start. Then each interval either extends the previous one or starts a new one."],
    functionName: "merge",
    signature: [["intervals", "number[][]"]],
    returns: "number[][]",
    reference: `function merge(intervals) {
  const sorted = intervals.map((i) => i.slice()).sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const iv of sorted) {
    const last = out[out.length - 1];
    if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1]);
    else out.push(iv);
  }
  return out;
}`,
    examples: [
      [[[[1, 3], [2, 6], [8, 10], [15, 18]]], [[1, 6], [8, 10], [15, 18]], "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]."],
      [[[[1, 4], [4, 5]]], [[1, 5]], "Intervals [1,4] and [4,5] are considered overlapping."],
      [[[[4, 7], [1, 4]]], [[1, 7]], "Intervals [1,4] and [4,7] are considered overlapping."],
    ],
    hidden: [
      [[[1, 4], [0, 4]]],
      [[[1, 4], [2, 3]]],
      [[[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]]],
      [[[1, 1]]],
      [Array.from({ length: 10_000 }, (_, i) => [i, i + (i % 2)])],
    ],
  },
  {
    id: 238,
    slug: "product-of-array-except-self",
    title: "Product of Array Except Self",
    difficulty: "Medium",
    tags: ["Array", "Prefix Sum"],
    acceptance: 67.2,
    description: [
      "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.",
      "You must write an algorithm that runs in `O(n)` time and **without using the division operation**.",
    ],
    constraints: [
      "2 <= nums.length <= 10^5",
      "-30 <= nums[i] <= 30",
      "The input is generated such that answer[i] is guaranteed to fit in a 32-bit integer.",
    ],
    hints: ["Build a prefix product pass and a suffix product pass."],
    functionName: "productExceptSelf",
    signature: [["nums", "number[]"]],
    returns: "number[]",
    reference: `function productExceptSelf(nums) {
  const n = nums.length;
  const out = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) { out[i] = prefix; prefix *= nums[i]; }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) { out[i] *= suffix; suffix *= nums[i]; }
  return out;
}`,
    examples: [
      [[[1, 2, 3, 4]], [24, 12, 8, 6]],
      [[[-1, 1, 0, -3, 3]], [0, 0, 9, 0, 0]],
      [[[2, 3]], [3, 2]],
    ],
    hidden: [
      [[0, 0]],
      [[1, 0]],
      [[5, -2, 4]],
      [Array.from({ length: 50_000 }, (_, i) => (i % 3 === 0 ? -1 : 1))],
    ],
  },
];
