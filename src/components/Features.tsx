import React from 'react';
import FeatureCard from './FeatureCard';
import { FeatureCardProps } from '../types';

const Features: React.FC = () => {
  const features: FeatureCardProps[] = [
    {
      icon: '🏠',
      title: 'Smart Matching',
      description: 'Our algorithm matches you with compatible roommates based on lifestyle, preferences, and budget',
    },
    {
      icon: '🔒',
      title: 'Verified Profiles',
      description: 'All users are verified with background checks and identity verification for your safety',
    },
    {
      icon: '💬',
      title: 'Easy Communication',
      description: 'Chat directly with potential roommates and schedule viewings seamlessly',
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