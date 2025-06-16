import React from 'react';
import FeatureCard from './FeatureCard';
import { FeatureCardProps } from '../../types';

const Features: React.FC = () => {
  const features: FeatureCardProps[] = [
    {
      icon: '🤖',
      title: 'AI-Powered Matching',
      description: 'Our smart algorithm finds compatible roommates based on lifestyle, budget, and living preferences',
    },
    {
      icon: '📍',
      title: 'Location-Based Search',
      description: 'Find roommates in your preferred neighborhoods with detailed area insights and commute preferences',
    },
    {
      icon: '🔒',
      title: 'Safe & Verified',
      description: 'All profiles are verified with secure messaging and privacy protection built-in',
    },
  ];

  return (
    <div className="features">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </div>
  );
};

export default Features;