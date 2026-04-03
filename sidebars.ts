import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '🏛 Architecture & Design',
      link: {type: 'generated-index', description: 'Architecture & System Design 문서 모음'},
      items: [
        'architecture/msa',
        'architecture/msa-resiliency-patterns',
        'architecture/Saga-Pattern',
        'architecture/Event-Driven-Architecture',
        'architecture/kafka-deepdive',
        'architecture/system-design-object-storage',
      ],
    },
    {
      type: 'category',
      label: '⚙️ Backend Engineering',
      link: {type: 'generated-index', description: 'Backend Engineering (API / Concurrency / Patterns) 문서 모음'},
      items: [
        'backend/rest-api-design',
        'backend/webhooks-asynchronous-api',
        'backend/vertx',
        'backend/vertx_troubleshooting',
      ],
    },
    {
      type: 'category',
      label: '☕️ Java & Spring',
      link: {type: 'generated-index', description: 'Java & Spring 문서 모음'},
      items: [
        'java-spring/JVM',
        'java-spring/java-performance',
        'java-spring/lambda-usage',
        'java-spring/Querydsl',
        'java-spring/mybatis',
        'java-spring/spring-aop-cache',
        'java-spring/spring-rest-doc',
        'java-spring/spring-data-jpa-optimization',
        'java-spring/spring-boot-tomcat-tuning',
        'java-spring/tomcat-tuning',
      ],
    },
    {
      type: 'category',
      label: '💾 Data (RDB/NoSQL)',
      link: {type: 'generated-index', description: 'Data (RDB / NoSQL / Cache) 문서 모음'},
      items: [
        'data/hierarchical-data-modeling',
        'data/database-performance-optimization',
        'data/MariaDB',
        'data/MongoDB',
        'data/mongodb-operation-guide',
        'data/Redis',
        'data/redis-data-modeling',
        'data/redis-cache-strategies',
      ],
    },
    {
      type: 'category',
      label: '☁️ Cloud & DevOps',
      link: {type: 'generated-index', description: 'Cloud / Infra / DevOps 문서 모음'},
      items: [
        'cloud-devops/AWS-NAT-gateway',
        'cloud-devops/Serverless',
        'cloud-devops/Docker',
        'cloud-devops/docker-image-optimization',
        'cloud-devops/Nginx',
      ],
    },
    {
      type: 'category',
      label: '📐 Software Design',
      link: {type: 'generated-index', description: 'Software Design & Quality 문서 모음'},
      items: [
        'quality-tools/software-development-principles',
        'quality-tools/clean-code-cases',
        'quality-tools/design-patterns',
      ],
    },
    {
      type: 'category',
      label: '🧮 Algorithms',
      link: {type: 'generated-index', description: 'Algorithms & Data Structures 문서 모음'},
      items: [
        'algorithms/Algorithm',
        'algorithms/large-data-duplicate-removal',
      ],
    },
    {
      type: 'category',
      label: '🛠 Tools',
      link: {type: 'generated-index', description: 'Tools (Local / CLI) 문서 모음'},
      items: [
        'quality-tools/linux-commands',
        'quality-tools/vim-shortcuts',
      ],
    },
    {
      type: 'category',
      label: '🚀 Projects',
      link: {type: 'generated-index', description: 'Projects & Templates 문서 모음'},
      items: [
        'projects/ondemand-video-streaming',
        'projects/project-document-template',
        'projects/multi-repo-vs-mono-repo',
      ],
    },
  ],
};

export default sidebars;
