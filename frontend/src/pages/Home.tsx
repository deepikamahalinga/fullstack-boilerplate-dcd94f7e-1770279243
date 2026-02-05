import { FC, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface Stat {
  value: string;
  label: string;
}

const Home: FC = () => {
  const features: Feature[] = [
    {
      title: 'TypeScript Ready',
      description: 'Built with type safety and modern development practices in mind',
      icon: '🔷'
    },
    {
      title: 'Clean Architecture',
      description: 'Organized component structure and clear separation of concerns',
      icon: '🏗️'
    },
    {
      title: 'API Integration',
      description: 'Pre-configured API architecture with proper error handling',
      icon: '🔌'
    },
    {
      title: 'Responsive Design',
      description: 'Mobile-first approach with modern UI/UX principles',
      icon: '📱'
    }
  ];

  const stats: Stat[] = [
    { value: '100%', label: 'Type Safe' },
    { value: '50+', label: 'Components' },
    { value: '95+', label: 'Lighthouse Score' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Fullstack Boilerplate
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Production-ready full-stack application template with React and Node.js, 
            powered by TypeScript for reliable development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/docs"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 
                transition-colors duration-300"
            >
              Get Started
            </Link>
            <Link
              to="/demo"
              className="bg-gray-100 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-200 
                transition-colors duration-300"
            >
              Live Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Entity Showcase */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-blue-50 rounded-2xl p-8"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Core Entities</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <Link
              to="/users"
              className="block p-6 bg-white rounded-xl hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">👤</div>
                <div>
                  <h3 className="text-xl font-semibold">User Management</h3>
                  <p className="text-gray-600">
                    Complete user authentication and management system
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;