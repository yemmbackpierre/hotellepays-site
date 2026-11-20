"use client";

import { useState } from 'react';
import { BlogPost } from "@/app/types/hotelData";
import { v4 as uuidv4 } from 'uuid';

interface Props {
    post: BlogPost;
}

const BlogDetails = ({ post }: Props) => {
    const [comments, setComments] = useState(post.comments || []);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const postauthor = 'Yem Mback Pierre';

    // Pré-calculer la date en UTC pour éviter les mismatches SSR/client
    const postDate = new Date(post.date);
    const day = Number.isNaN(postDate.getTime()) ? "" : postDate.getUTCDate();
    const month = Number.isNaN(postDate.getTime())
        ? ""
        : new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC' }).format(postDate);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!name || !email || !message) {
            alert("Tous les champs doivent être remplis.");
            return;
        }

        setIsSubmitting(true);

        const newComment = {
            id: uuidv4(),
            author: name,
            date: new Date().toISOString(),
            content: message
        };

        setComments([...comments, newComment]);

        setName("");
        setEmail("");
        setMessage("");
        setFormSubmitted(true);
        setIsSubmitting(false);
    };

    return (
        <section className="blog-details pt-120 pb-120">
            <div className="container">
                <div className="row">
                    <div className="col-xl-8 col-lg-7">
                        <div className="blog-details__left">

                            {/* Image + date */}
                            <div className="blog-details__img">
                                <img src={post.thumb} alt={post.title} />
                                <div className="blog-details__date">
                                    <span className="day">{day}</span>
                                    <span className="month">{month}</span>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="blog-details__content">
                                <ul className="list-unstyled blog-details__meta">
                                    <li><a href="mailto:yemmbackpierre@gmail.com"><i className="fas fa-user-circle"></i> {postauthor}</a></li>
                                    <li><a href="#comments"><i className="fas fa-comments"></i> {comments.length} Commentaires</a></li>
                                </ul>

                                <h3 className="blog-details__title">{post.title}</h3>

                                {/* ✅ Hydration-safe HTML content */}
                                <div
                                    className="blog-details__text-2"
                                    dangerouslySetInnerHTML={{ __html: post.html_content || "" }}
                                />
                            </div>

                            {/* Tags et réseaux sociaux */}
                            <div className="blog-details__bottom">
                                <p className="blog-details__tags">
                                    <span>Tags</span>
                                    {post.tags?.map((tag, idx) => (
                                        <a href="#" key={idx}>{tag}</a>
                                    ))}
                                </p>
                                <div className="blog-details__social-list">
                                    <a href="#"><i className="fab fa-x-twitter"></i></a>
                                    <a href="#"><i className="fab fa-facebook"></i></a>
                                    <a href="#"><i className="fab fa-pinterest-p"></i></a>
                                    <a href="#"><i className="fab fa-instagram"></i></a>
                                </div>
                            </div>

                            {/* Commentaires */}
                            <div className="comment-one" id="comments">
                                <h3 className="comment-one__title">{comments.length} Commentaires</h3>

                                {comments.map((comment) => (
                                    <div className="comment-one__single" key={comment.id}>
                                        <div className="comment-one__image">
                                            <img src="/assets/images/avatar/default-avatar.png" alt="Client" />
                                        </div>
                                        <div className="comment-one__content">
                                            <h3>{comment.author}</h3>
                                            <p>{comment.content}</p>
                                            <a href="#" className="theme-btn btn-style-one comment-one__btn">Répondre</a>
                                        </div>
                                    </div>
                                ))}

                                {/* Formulaire */}
                                {showCommentForm && (
                                    <div className="comment-form">
                                        <h3 className="comment-form__title">Laisser un commentaire</h3>
                                        <form onSubmit={handleSubmit}>
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <input
                                                        name="name"
                                                        className="form-control"
                                                        type="text"
                                                        placeholder="Entrez votre nom"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-sm-6">
                                                    <input
                                                        name="email"
                                                        className="form-control"
                                                        type="email"
                                                        placeholder="Entrez votre email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <textarea
                                                name="message"
                                                className="form-control"
                                                rows={5}
                                                placeholder="Entrez votre message"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                required
                                            />
                                            <button type="submit" className="theme-btn-nine" disabled={isSubmitting}>
                                                {isSubmitting ? 'Soumission en cours...' : 'Soumettre le commentaire'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {!showCommentForm && (
                                    <button className="theme-btn" onClick={() => setShowCommentForm(true)}>
                                        Laisser un commentaire
                                    </button>
                                )}

                                {formSubmitted && !isSubmitting && (
                                    <div className="alert alert-success">
                                        Merci pour votre commentaire ! Il a été soumis avec succès.
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    <div className="col-xl-4 col-lg-5">
                        <div className="sidebar">
                            {/* Sidebar content */}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default BlogDetails;