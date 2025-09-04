// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Department data
export const departmentData = [
  {
    id: "dept1",
    name: "Engineering",
    description: "Software development and technical operations team responsible for building and maintaining our products.",
    employeeCount: 3
  },
  {
    id: "dept2",
    name: "Marketing",
    description: "Team focused on brand management, advertising campaigns, and market research to promote our products.",
    employeeCount: 2
  },
  {
    id: "dept3",
    name: "Human Resources",
    description: "Responsible for recruiting, onboarding, training, and addressing employee concerns and workplace needs.",
    employeeCount: 1
  }
];

// Employee data
export const employeeData = [
  {
    id: "emp1",
    name: "Alex Johnson",
    position: "Senior Developer",
    email: "alex.johnson@company.com",
    phone: "+1 (555) 123-4567",
    address: "123 Tech Lane, San Francisco, CA",
    age: 32,
    joinDate: "2021-03-15",
    departmentId: "dept1",
    profilePic: "https://i.pravatar.cc/150?img=11",
    jobDescription: "Lead developer responsible for architecture decisions and mentoring junior team members. Specializes in backend systems and API design."
  },
  {
    id: "emp2",
    name: "Sarah Williams",
    position: "UI/UX Designer",
    email: "sarah.williams@company.com",
    phone: "+1 (555) 987-6543",
    address: "456 Design Ave, San Francisco, CA",
    age: 28,
    joinDate: "2022-01-10",
    departmentId: "dept1",
    profilePic: "https://i.pravatar.cc/150?img=5",
    jobDescription: "Creates user-centered designs by understanding business requirements and user feedback. Specializes in creating wireframes, prototypes, and user testing."
  },
  {
    id: "emp3",
    name: "Michael Chen",
    position: "DevOps Engineer",
    email: "michael.chen@company.com",
    phone: "+1 (555) 234-5678",
    address: "789 Server Road, San Francisco, CA",
    age: 30,
    joinDate: "2021-08-22",
    departmentId: "dept1",
    profilePic: "https://i.pravatar.cc/150?img=12",
    jobDescription: "Manages deployment infrastructure and CI/CD pipelines. Focuses on system reliability, performance optimization, and automated deployment processes."
  },
  {
    id: "emp4",
    name: "Emily Rodriguez",
    position: "Marketing Manager",
    email: "emily.rodriguez@company.com",
    phone: "+1 (555) 345-6789",
    address: "321 Brand Street, San Francisco, CA",
    age: 34,
    joinDate: "2020-11-05",
    departmentId: "dept2",
    profilePic: "https://i.pravatar.cc/150?img=25",
    jobDescription: "Develops marketing strategies, coordinates campaigns, and analyzes market trends to increase brand awareness and customer engagement."
  },
  {
    id: "emp5",
    name: "David Wilson",
    position: "Content Specialist",
    email: "david.wilson@company.com",
    phone: "+1 (555) 456-7890",
    address: "654 Content Court, San Francisco, CA",
    age: 27,
    joinDate: "2022-03-18",
    departmentId: "dept2",
    profilePic: "https://i.pravatar.cc/150?img=15",
    jobDescription: "Creates engaging content across various platforms. Specializes in copywriting, blogging, and social media content development."
  },
  {
    id: "emp6",
    name: "Jessica Taylor",
    position: "HR Director",
    email: "jessica.taylor@company.com",
    phone: "+1 (555) 567-8901",
    address: "987 People Place, San Francisco, CA",
    age: 36,
    joinDate: "2020-05-12",
    departmentId: "dept3",
    profilePic: "https://i.pravatar.cc/150?img=33",
    jobDescription: "Oversees all HR functions including recruiting, training, benefits, and employee relations. Develops HR strategies aligned with business objectives."
  }
];

// Task data
export const taskData = [
  {
    id: "task1",
    title: "Implement Authentication System",
    description: "Create a secure authentication system with login, registration, password reset, and OAuth integration. Use JWT for authentication tokens and ensure proper validation and error handling.",
    date: "2025-08-20",
    priority: "high",
    status: "in-progress",
    employeeId: "emp1"
  },
  {
    id: "task2",
    title: "Design Landing Page",
    description: "Create wireframes and mockups for the new product landing page. Focus on conversion optimization, clear call-to-actions, and mobile responsiveness.",
    date: "2025-08-15",
    priority: "medium",
    status: "planned",
    employeeId: "emp2"
  },
  {
    id: "task3",
    title: "Optimize Database Queries",
    description: "Review and optimize current database queries to improve application performance. Identify slow queries, create proper indexes, and refactor where necessary.",
    date: "2025-08-18",
    priority: "medium",
    status: "planned",
    employeeId: "emp1"
  },
  {
    id: "task4",
    title: "Set Up Kubernetes Cluster",
    description: "Configure and deploy a Kubernetes cluster for our production environment. Include autoscaling, monitoring, and disaster recovery solutions.",
    date: "2025-08-25",
    priority: "high",
    status: "planned",
    employeeId: "emp3"
  },
  {
    id: "task5",
    title: "Create Q3 Marketing Strategy",
    description: "Develop comprehensive marketing strategy for Q3, including campaign ideas, budget allocation, and performance metrics tracking.",
    date: "2025-08-14",
    priority: "high",
    status: "completed",
    employeeId: "emp4"
  },
  {
    id: "task6",
    title: "Write Product Launch Blog Post",
    description: "Create engaging blog post announcing our new product features. Include use cases, benefits, and visual examples of the new functionality.",
    date: "2025-08-16",
    priority: "medium",
    status: "in-progress",
    employeeId: "emp5"
  },
  {
    id: "task7",
    title: "Conduct Employee Satisfaction Survey",
    description: "Create and distribute annual employee satisfaction survey. Analyze results and prepare report with recommendations for leadership team.",
    date: "2025-08-28",
    priority: "medium",
    status: "planned",
    employeeId: "emp6"
  },
  {
    id: "task8",
    title: "Update API Documentation",
    description: "Review and update all API documentation to ensure it matches current implementation. Add more examples and improve clarity for external developers.",
    date: "2025-08-12",
    priority: "low",
    status: "in-progress",
    employeeId: "emp1"
  },
  {
    id: "task9",
    title: "Redesign User Profile Page",
    description: "Update user profile page design to improve usability and incorporate new feature access. Focus on information hierarchy and navigation improvements.",
    date: "2025-08-19",
    priority: "medium",
    status: "planned",
    employeeId: "emp2"
  },
  {
    id: "task10",
    title: "Implement CI/CD Pipeline",
    description: "Set up automated testing and deployment pipeline using GitHub Actions. Configure testing, building, and deployment stages for different environments.",
    date: "2025-08-22",
    priority: "high",
    status: "in-progress",
    employeeId: "emp3"
  },
  {
    id: "task11",
    title: "Analyze Competitor Social Media Strategy",
    description: "Research and document competitor social media presence, content strategy, posting frequency, and engagement levels. Provide recommendations for our strategy.",
    date: "2025-08-17",
    priority: "low",
    status: "planned",
    employeeId: "emp4"
  },
  {
    id: "task12",
    title: "Update Employee Handbook",
    description: "Review and update employee handbook with new policies, benefits information, and company procedures. Ensure legal compliance and clear communication.",
    date: "2025-08-30",
    priority: "medium",
    status: "planned",
    employeeId: "emp6"
  }
];