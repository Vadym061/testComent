import React, { useEffect, useState } from "react";
import axios from "axios";

function Comment() {
    const [comments, setComments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        feedback: '',
        avatar: null,
    });

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/comments');
                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments', error);
            }
        };
        fetchComments();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, avatar: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', formData.name);
        form.append('feedback', formData.feedback);
        if (formData.avatar) {
            form.append('avatar', formData.avatar);
        }
    
        try {
            await axios.post('http://localhost:5000/api/comments', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const response = await axios.get('http://localhost:5000/api/comments');
            setComments(response.data);
        } catch (error) {
            console.error('Error adding comment', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/comments/${id}`);
            setComments(comments.filter(comment => comment._id !== id));
        } catch (error) {
            console.error('Error deleting comment', error);
        }
    };

    return (
        <div>
            <h1>Comments</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                />
                <textarea
                    name="feedback"
                    placeholder="Your Feedback"
                    value={formData.feedback}
                    onChange={handleInputChange}
                />
                <input
                    type="file"
                    name="avatar"
                    onChange={handleFileChange}
                />
                <button type="submit">Submit</button>
            </form>
            <div>
            <h1>Comments</h1>
            <ul>
                {comments.map(comment => (
                    <li key={comment._id}>
                        <h3>{comment.name}</h3>
                        <p>{comment.feedback}</p>
                        {comment.avatar && <img src={`http://localhost:5000/${comment.avatar}`} alt="avatar" />}
                        <button onClick={() => handleDelete(comment._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
        </div>
    );
}

export default Comment;