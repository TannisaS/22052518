const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

const BASE_URL = "http://20.244.56.144/evaluation-service";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN; 

// Fetch all users
const getUsers = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/users`, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`, // Use secure token storage
                "Content-Type": "application/json"
            }           
        });
        return response.data.users || {};
    } catch (error) {
        console.error("Error fetching users:", error.message);
        return {};
    }
};


// Fetch all posts by a user
const getUserPosts = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/users/${userId}/posts`);
        return response.data.posts || [];
    } catch (error) {
        console.error(`Error fetching posts for user ${userId}:`, error.message);
        return [];
    }
};

// Fetch comments for a post
const getPostComments = async (postId) => {
    try {
        const response = await axios.get(`${BASE_URL.replace("56.144", "36.144")}/posts/${postId}/comments`);
        return response.data.comments || [];
    } catch (error) {
        console.error(`Error fetching comments for post ${postId}:`, error.message);
        return [];
    }
};

// Get Top 5 Users with the most posts
app.get("/users", async (req, res) => {
    const users = await getUsers();
    let postCounts = [];

    await Promise.all(Object.keys(users).map(async (userId) => {
        const posts = await getUserPosts(userId);
        postCounts.push({ userId, name: users[userId], postCount: posts.length });
    }));

    postCounts.sort((a, b) => b.postCount - a.postCount);
    res.json({ top_users: postCounts.slice(0, 5) });
});

// Get Top/Latest Posts
app.get("/posts", async (req, res) => {
    const type = req.query.type;

    let allPosts = [];
    const users = await getUsers();

    await Promise.all(Object.keys(users).map(async (userId) => {
        const posts = await getUserPosts(userId);
        allPosts = allPosts.concat(posts);
    }));

    if (type === "latest") {
        // Sort by post ID (assuming higher ID means newer post)
        allPosts.sort((a, b) => b.id - a.id);
        return res.json({ latest_posts: allPosts.slice(0, 5) });
    } else if (type === "popular") {
        let commentCounts = [];

        await Promise.all(allPosts.map(async (post) => {
            const comments = await getPostComments(post.id);
            commentCounts.push({ post, commentCount: comments.length });
        }));

        const maxComments = Math.max(...commentCounts.map(c => c.commentCount), 0);
        const popularPosts = commentCounts.filter(c => c.commentCount === maxComments).map(c => c.post);

        return res.json({ popular_posts: popularPosts });
    }

    res.status(400).json({ error: "Invalid type parameter. Use 'latest' or 'popular'." });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
