// MDCraft - Enhanced UI JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Add smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Create a reading progress indicator
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  document.body.appendChild(progressBar);

  // Update reading progress
  function updateReadingProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
    progressBar.style.width = `${scrollPercent}%`;
  }

  // Create style for reading progress
  const style = document.createElement('style');
  style.textContent = `
    .reading-progress {
      position: fixed;
      top: 0;
      left: 0;
      height: 4px;
      background: linear-gradient(to right, #4a6bdf, #6c63ff);
      z-index: 1000;
      width: 0%;
      transition: width 0.1s ease;
    }
    
    /* Add subtle hover effects to cards */
    .card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    
    /* Add animation for page loads */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    main.container {
      animation: fadeIn 0.6s ease forwards;
    }
  `;
  document.head.appendChild(style);

  // Add event listener for scroll to update progress bar
  window.addEventListener('scroll', updateReadingProgress);
  updateReadingProgress(); // Initialize on load

  // Add copy button to code blocks
  document.querySelectorAll('pre').forEach(pre => {
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-code-button';
    copyButton.textContent = 'Copy';
    
    copyButton.addEventListener('click', () => {
      const code = pre.textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
    
    pre.style.position = 'relative';
    pre.appendChild(copyButton);
  });
  
  // Add another style block for the copy button
  const copyButtonStyle = document.createElement('style');
  copyButtonStyle.textContent = `
    .copy-code-button {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 4px;
      color: #e2e8f0;
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .copy-code-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `;
  document.head.appendChild(copyButtonStyle);
  
  // Add dark mode toggle
  const darkModeToggle = document.createElement('button');
  darkModeToggle.className = 'dark-mode-toggle';
  darkModeToggle.innerHTML = '🌙';
  darkModeToggle.title = 'Toggle dark mode';
  document.querySelector('header.container').appendChild(darkModeToggle);
  
  // Check for saved dark mode preference
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '☀️';
  }
  
  // Dark mode toggle event listener
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    darkModeToggle.innerHTML = isDark ? '☀️' : '🌙';
  });
  
  // Add dark mode styles
  const darkModeStyle = document.createElement('style');
  darkModeStyle.textContent = `
    .dark-mode-toggle {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      margin-left: 1rem;
      padding: 0.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    .dark-mode-toggle:hover {
      background: rgba(0,0,0,0.05);
    }
    
    .dark-mode {
      --fg: #e2e8f0;
      --muted: #a0aec0;
      --light-gray: #2d3748;
      --card: #1a202c;
      --bg: #171923;
      --primary: #7f9cf5;
      --primary-dark: #667eea;
      --secondary: #9f7aea;
    }
    
    .dark-mode .card,
    .dark-mode .sidebar,
    .dark-mode header.container {
      background: var(--card);
      border-color: var(--light-gray);
    }
    
    .dark-mode .badge {
      background: rgba(127, 156, 245, 0.2);
    }
    
    .dark-mode .cta {
      background: linear-gradient(135deg, #2d3748, #1a202c);
      border-color: #4a5568;
    }
    
    .dark-mode nav a:after {
      background-color: var(--primary);
    }
    
    .dark-mode .search input {
      background: #2d3748;
      border-color: #4a5568;
      color: var(--fg);
    }
    
    .dark-mode .list li {
      border-color: var(--light-gray);
    }
    
    .dark-mode .copy-code-button {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .dark-mode .copy-code-button:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `;
  document.head.appendChild(darkModeStyle);
  
  // Add category icons
  const categoryIcons = {
    'ai': '🤖',
    'fintech': '💰',
    'cloud': '☁️',
    'security': '🔒',
    'compliance': '📋',
    'tech': '💻',
    'data': '📊',
    'webdev': '🌐',
    'devops': '⚙️',
    'api': '🔌',
    'aws': '📦',
    'general': '📝'
  };
  
  // Add icons to category items
  document.querySelectorAll('.category-name').forEach(categoryElement => {
    const categoryName = categoryElement.textContent.toLowerCase();
    
    // Find the matching icon or use a default
    let icon = '📝'; // Default icon
    
    for (const [key, value] of Object.entries(categoryIcons)) {
      if (categoryName.includes(key)) {
        icon = value;
        break;
      }
    }
    
    // Prepend the icon
    categoryElement.innerHTML = `<span class="category-icon">${icon}</span> ${categoryElement.textContent}`;
  });
  
  // Add animation to tags cloud
  const tagsCloud = document.querySelector('.tags-cloud');
  if (tagsCloud) {
    const tagItems = tagsCloud.querySelectorAll('.tag-cloud-item');
    
    tagItems.forEach((tag, index) => {
      tag.style.animationDelay = `${index * 0.05}s`;
    });
    
    // Add CSS for tag animation
    const tagAnimationStyle = document.createElement('style');
    tagAnimationStyle.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .tag-cloud-item {
        animation: fadeInUp 0.5s ease forwards;
        opacity: 0;
      }
    `;
    document.head.appendChild(tagAnimationStyle);
  }
});
