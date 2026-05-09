import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/home.css';

function HomePage() {
  const [hotJobs, setHotJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: '找工作，上招聘之家',
      subtitle: '数百万优质职位等你来选',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20job%20search%20website%20banner%20with%20professional%20people&image_size=landscape_16_9',
    },
    {
      title: '企业招聘，高效便捷',
      subtitle: '连接优秀人才与优质企业',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=corporate%20recruitment%20banner%20with%20business%20team&image_size=landscape_16_9',
    },
    {
      title: '职场博客，分享经验',
      subtitle: '学习职场技巧，加速职业成长',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=career%20blog%20banner%20with%20laptop%20and%20coffee&image_size=landscape_16_9',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, companiesRes] = await Promise.all([
          api.get('/jobs/hot'),
          api.get('/companies/famous'),
        ]);
        setHotJobs(jobsRes.data.jobs || []);
        setCompanies(companiesRes.data.companies || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="home-page">
      <div className="carousel">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="carousel-overlay">
              <div className="container">
                <h1 className="carousel-title">{slide.title}</h1>
                <p className="carousel-subtitle">{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      <div className="container">
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">热门职位</h2>
            <Link to="/jobs" className="section-more">查看更多 →</Link>
          </div>
          <div className="job-grid">
            {hotJobs.slice(0, 6).map((job) => (
              <Link to={`/jobs/${job.id}`} key={job.id} className="job-card">
                <div className="job-header">
                  <h3 className="job-title">{job.title}</h3>
                  <span className="job-salary">{job.salary_min}-{job.salary_max}K</span>
                </div>
                <div className="job-meta">
                  <span className="job-tag">{job.city}</span>
                  <span className="job-tag">{job.experience}</span>
                  <span className="job-tag">{job.education}</span>
                </div>
                <div className="job-company">
                  {job.company?.name || '未知企业'}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">知名企业</h2>
            <Link to="/companies" className="section-more">查看更多 →</Link>
          </div>
          <div className="company-grid">
            {companies.map((company) => (
              <Link to={`/companies/${company.id}`} key={company.id} className="company-card">
                <div className="company-logo">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} />
                  ) : (
                    <span className="company-initial">{company.name.charAt(0)}</span>
                  )}
                </div>
                <h3 className="company-name">{company.name}</h3>
                <p className="company-industry">{company.industry}</p>
                <p className="company-scale">{company.scale}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="section features-section">
          <h2 className="section-title text-center">为什么选择招聘之家</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>精准匹配</h3>
              <p>智能算法匹配，让你找到最合适的工作</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>快速响应</h3>
              <p>企业快速响应，求职不再等待</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>信息安全</h3>
              <p>严格的信息保护，保障隐私安全</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>职场博客</h3>
              <p>海量职场干货，助力职业成长</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>招聘之家</h3>
              <p>专业的求职招聘平台</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>求职者</h4>
                <Link to="/jobs">找工作</Link>
                <Link to="/blogs">职场博客</Link>
              </div>
              <div className="footer-column">
                <h4>企业</h4>
                <Link to="/companies">知名企业</Link>
                <Link to="/register">企业入驻</Link>
              </div>
              <div className="footer-column">
                <h4>关于我们</h4>
                <span>联系电话：400-123-4567</span>
                <span>邮箱：contact@recruithub.com</span>
              </div>
            </div>
          </div>
          <div className="footer-copyright">
            © 2024 招聘之家. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
