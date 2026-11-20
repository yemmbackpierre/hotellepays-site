"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { BlogPost, defaultPosts } from "@/app/types/hotelData";

type BlogSectionProps = {
    posts?: BlogPost[];
    title?: string;
};

const BlogSection: React.FC<BlogSectionProps> = ({
                                                     posts = defaultPosts,
                                                     title = "Dernières nouvelles et articles",
                                                 }) => {
    return (
        <section className="blog-area">
            <div className="container">
                <div className="row justify-content-between">
                    <div className="col-xl-6">
                        <div className="section-wrapper mb-3 mb-lg-0 mb-xl-5">
                            <h2 className="section-title text-reveal-anim">{title}</h2>
                        </div>
                    </div>
                    <div className="col-xl-3">
                        <div className="blog-arrow-box d-flex justify-content-xl-end">
                            <button className="slider-prev">
                                <i className="fa-regular fa-arrow-left"></i>
                            </button>
                            <button className="slider-next">
                                <i className="fa-regular fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-12">
                        <div
                            className="blog-slide-wrapper mt-5 mt-xl-0"
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            data-aos-delay="200"
                        >
                            <Swiper
                                modules={[Navigation]}
                                navigation={{
                                    nextEl: ".slider-next",
                                    prevEl: ".slider-prev",
                                }}
                                slidesPerView={3}
                                spaceBetween={30}
                                loop={true}
                                className="swiper-container blog-active"
                            >
                                {posts.map((post, idx) => (
                                        <SwiperSlide key={idx} className="blog-box swiper-slide">
                                            <div className="image-box">
                                                {/* ⚠️ doublon d’image conservé volontairement */}
                                                <img className="w-img" src={post.thumb} alt="blog" />
                                                <img className="w-img" src={post.thumb} alt="blog" />
                                                <a className="img-btn" href={post.link}></a>
                                            </div>

                                            <div className="content-box">
                                                <div className="post-meta">
                                                    <ul>
                                                        <li>
                                                            <i className="fa-classic fa-light fa-calendar-days"></i>{" "}
                                                            {post.date}
                                                        </li>
                                                        <li>
                                                            <i className="fa-classic fa-light fa-comments"></i>{" "}
                                                            {post.comments_number} Comment
                                                        </li>
                                                    </ul>
                                                </div>

                                                <h4 className="title">
                                                    <a href={post.link}>{post.title}</a>
                                                </h4>

                                                <div className="button">
                                                    <a className="theme-btn-main" href={post.link}>
                            <span className="theme-btn-arrow-left theme-color-white">
                              <img
                                  className="filter-white"
                                  src="/assets/images/icons/button-arrow.svg"
                                  alt="arrow"
                              />
                            </span>
                                                        <span className="theme-btn theme-color-white">
                              More Details
                            </span>
                                                        <span className="theme-btn-arrow-right theme-color-white">
                              <img
                                  className="filter-white"
                                  src="/assets/images/icons/button-arrow.svg"
                                  alt="arrow"
                              />
                            </span>
                                                    </a>
                                                </div>
                                            </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BlogSection;
