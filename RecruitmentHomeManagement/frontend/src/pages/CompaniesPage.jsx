import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get('/companies/famous');
        setCompanies(response.data.companies || []);
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <div className="jobs-page">
      <div className="container">
        <div className="page-header">
          <h2>知名企业</h2>
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : companies.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🏢</div>
            <p>暂无企业信息</p>
          </div>
        ) : (
          <div className="company-grid">
            {companies.map((company) => (
              <Link to={`/companies/${company.id}`} key={company.id} className="company-card">
                <div className="company-logo">
                  <span className="company-initial">{company.name.charAt(0)}</span>
                </div>
                <h3 className="company-name">{company.name}</h3>
                <p className="company-industry">{company.industry}</p>
                <p className="company-scale">{company.scale}</p>
                <p className="company-scale" style={{ color: '#8c8c8c' }}>{company.city}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompaniesPage;
