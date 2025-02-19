document.addEventListener('DOMContentLoaded', () => {
    // Get necessary elements from the DOM
    const horizontalContent = document.querySelector('.horizontal-content');
    const scrollLine = document.querySelector('.scroll-line');
    const mainCircles = document.querySelectorAll('.main-circle');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalCard = document.querySelector('.modal-card');
    const closeBtn = document.querySelector('.close-btn');
    const modalTitle = document.querySelector('.modal-title');
    const modalContent = document.querySelector('.modal-content');
    // periodText assumed to be inside modalContent if needed
    const periodText = document.querySelector('.period-text');
    
    // Set initial values
    let scrollProgress = 0;
    let currentActiveMainCircle = null;
    let currentActiveSubcircle = null;
    let isModalOpen = false;
    let isAnyMainCircleExpanded = false;
    
    // Animation timeline
    let timeline = anime.timeline({
        autoplay: false,
        easing: 'easeInOutQuad'
    });
    
    // Setup initial dimensions and create animation timeline
    const updateDimensions = () => {
        const viewportWidth = window.innerWidth;
        const contentWidth = horizontalContent.offsetWidth;
        scrollLine.style.width = '0';
        
        // Set up the animation timeline with new dimensions
        timeline = anime.timeline({
            autoplay: false,
            easing: 'easeInOutQuad'
        });
        
        // Animation for horizontal scrolling effect
        timeline.add({
            targets: horizontalContent,
            translateX: [0, -(contentWidth - viewportWidth)],
            duration: 1000
        }, 0);
        
        // Animation for the scroll line progress
        timeline.add({
            targets: scrollLine,
            width: [0, contentWidth],
            duration: 1000
        }, 0);

        // Position subcircle branches
        positionBranches();
    };

    // Position subcircle branches in a circular pattern around main circles
    const positionBranches = () => {
        mainCircles.forEach(mainCircle => {
            const branches = mainCircle.querySelectorAll('.branch');
            const totalBranches = branches.length;
            
            branches.forEach((branch, index) => {
                // Calculate angle for even distribution (from 0 to 300 degrees)
                const angle = index * (300 / (totalBranches - 1)) - 150;
                
                // Set branch angle and position
                branch.style.transform = `rotate(${angle}deg)`;
                
                // Get the subcircle in this branch
                const subcircle = branch.querySelector('.subcircle');
                if (subcircle) {
                    // Adjust subcircle position based on parent branch angle
                    subcircle.style.transform = `translate(50%, -50%) rotate(${-angle}deg)`;
                    
                    // Store original transform for hover effects
                    subcircle.dataset.originalTransform = `translate(50%, -50%) rotate(${-angle}deg)`;
                }
            });
        });
    };
    
    // Initialize dimensions on page load
    updateDimensions();
    
    // Handle window resize to maintain responsive behavior
    window.addEventListener('resize', updateDimensions);
    
    // Handle scroll event for horizontal movement
    window.addEventListener('scroll', () => {
        if (isModalOpen) return;
        
        // Calculate scroll progress based on vertical scroll position
        const introHeight = document.querySelector('.intro').offsetHeight;
        const scrollTop = window.pageYOffset - introHeight;
        const scrollHeight = document.querySelector('.horizontal-section').offsetHeight;
        scrollProgress = Math.max(0, Math.min(1, scrollTop / (scrollHeight - window.innerHeight)));
        
        // Update animation progress to match scroll position
        timeline.seek(timeline.duration * scrollProgress);
        
        // If any main circle is expanded and we scroll, close it
        if (isAnyMainCircleExpanded && scrollTop > 0) {
            closeExpandedMainCircle();
        }
        
        // Check which main circle should be highlighted based on scroll position
        checkMainCircleActivation();
    });
    
    // Check which main circle to activate based on scroll progress
    const checkMainCircleActivation = () => {
        // If modal is open or any circle is expanded, don't change the activation state
        if (isModalOpen || isAnyMainCircleExpanded) return;
        
        const numCircles = mainCircles.length;
        const segmentSize = 1 / numCircles;
        
        // Determine which segment we're in
        let activeIndex = Math.floor(scrollProgress / segmentSize);
        activeIndex = Math.min(activeIndex, numCircles - 1);
        
        // Reset all circles
        mainCircles.forEach(circle => {
            circle.classList.remove('active');
        });
        
        // Activate the current circle if we have scrolled enough
        if (scrollProgress > 0) {
            mainCircles[activeIndex].classList.add('active');
            currentActiveMainCircle = mainCircles[activeIndex];
        } else {
            currentActiveMainCircle = null;
        }
    };
    
    // Main circle click event to show branches and subcircles
    mainCircles.forEach(mainCircle => {
        mainCircle.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Don't allow expanding while modal is open
            if (isModalOpen) return;
            
            // If this circle is already expanded, do nothing
            if (mainCircle.classList.contains('expanded')) return;
            
            // If any other circle is expanded, close it first
            if (isAnyMainCircleExpanded) {
                closeExpandedMainCircle();
            }
            
            // Expand this circle
            mainCircle.classList.add('expanded', 'active');
            isAnyMainCircleExpanded = true;
            currentActiveMainCircle = mainCircle;
            
            // Animate the main circle expansion
            anime({
                targets: mainCircle,
                scale: 1.1,
                boxShadow: '0 0 40px rgba(152, 68, 183, 0.7)',
                duration: 500
            });
            
            // Show and animate branches and subcircles
            const subcircles = mainCircle.querySelectorAll('.subcircle');
            anime({
                targets: subcircles,
                scale: [0, 1],
                opacity: [0, 1],
                delay: anime.stagger(100),
                duration: 600,
                easing: 'easeOutElastic(1, 0.5)'
            });
        });
    });
    
    // Click anywhere else on the document to close expanded main circle
    document.addEventListener('click', (e) => {
        if (isModalOpen) return;
        if (!isAnyMainCircleExpanded) return;
        if (!e.target.closest('.main-circle')) {
            closeExpandedMainCircle();
        }
    });
    
    // Function to close expanded main circle and hide subcircles
    const closeExpandedMainCircle = () => {
        if (!isAnyMainCircleExpanded) return;
        const expandedCircle = document.querySelector('.main-circle.expanded');
        if (expandedCircle) {
            anime({
                targets: expandedCircle,
                scale: 1,
                boxShadow: '0 0 0 rgba(152, 68, 183, 0)',
                duration: 300,
                complete: () => {
                    expandedCircle.classList.remove('expanded');
                    if (expandedCircle !== currentActiveMainCircle) {
                        expandedCircle.classList.remove('active');
                    }
                }
            });
            
            const subcircles = expandedCircle.querySelectorAll('.subcircle');
            anime({
                targets: subcircles,
                scale: 0,
                opacity: 0,
                duration: 300,
                easing: 'easeInQuad'
            });
        }
        isAnyMainCircleExpanded = false;
    };
    
    // Subcircle hover effects
    document.querySelectorAll('.subcircle').forEach(subcircle => {
        // Mouse enter effect for subcircles
        subcircle.addEventListener('mouseenter', () => {
            if (isModalOpen) return;
            currentActiveSubcircle = subcircle;
            subcircle.classList.add('active');
            const originalTransform = subcircle.dataset.originalTransform || 'translate(50%, -50%)';
            const parentCircle = subcircle.closest('.main-circle');
            const siblings = parentCircle.querySelectorAll('.subcircle:not(.active)');
            
            anime({
                targets: subcircle,
                scale: 1.2,
                boxShadow: '0 0 30px rgba(201, 112, 219, 0.9)',
                duration: 300
            });
            
            anime({
                targets: siblings,
                opacity: 0.4,
                scale: 0.8,
                duration: 300
            });
        });
        
        // Mouse leave effect for subcircles
        subcircle.addEventListener('mouseleave', () => {
            if (isModalOpen) return;
            subcircle.classList.remove('active');
            currentActiveSubcircle = null;
            const originalTransform = subcircle.dataset.originalTransform || 'translate(50%, -50%)';
            const parentCircle = subcircle.closest('.main-circle');
            const siblings = parentCircle.querySelectorAll('.subcircle');
            
            anime({
                targets: subcircle,
                scale: 1,
                boxShadow: '0 0 0 rgba(201, 112, 219, 0)',
                duration: 300
            });
            
            anime({
                targets: siblings,
                opacity: 1,
                scale: 1,
                duration: 300
            });
        });
        
        // Click event for subcircles to open modal with detailed info
        subcircle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isModalOpen) return;
            
            // Retrieve data from subcircle attributes (adjust attribute names as needed)
            const title = subcircle.dataset.title || "Detail Title";
            const period = subcircle.dataset.period || "Period Information";
            const content = subcircle.dataset.content || "Detailed description goes here.";
            let tableHTML = '';
    
    if (subcircle.dataset.table) {
        try {
            const tableData = JSON.parse(subcircle.dataset.table);
            
            if (tableData.length > 0) {
                // Generate table HTML
                tableHTML = '<table class="results-table">';
                
                // Add table header
                tableHTML += '<thead><tr>';
                for (const key in tableData[0]) {
                    tableHTML += `<th>${key.charAt(0).toUpperCase() + key.slice(1)}</th>`;
                }
                tableHTML += '</tr></thead>';
                
                // Add table body with rows
                tableHTML += '<tbody>';
                tableData.forEach(row => {
                    tableHTML += '<tr>';
                    for (const key in row) {
                        tableHTML += `<td>${row[key]}</td>`;
                    }
                    tableHTML += '</tr>';
                });
                tableHTML += '</tbody>';
                
                tableHTML += '</table>';
            }
        } catch (error) {
            console.error('Error parsing table data:', error);
        }
    }

    let githubLinksHtml = '';
    if (subcircle.dataset.githubLinks) {
        try {
            const links = JSON.parse(subcircle.dataset.githubLinks);
            if (links.length > 0) {
                githubLinksHtml = `
                    <ul class="github-projects type="none">
                        ${links.map(link => `
                            <li>
                                <a href="${link.url}" target="_blank">
                                    ${link.name} ${link.additional}
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                `;
            }
        } catch (e) {
            console.error('Error parsing GitHub links:', e);
        }
    }


            modalTitle.textContent = title;
            modalContent.innerHTML = `<div class="modal-scroll-container"><p class="period-text">${period}</p><p>${content}</p>${tableHTML}<br>${githubLinksHtml}</div>`;
            
            if (!modalCard.querySelector('.showcase-circle')) {
                const showcase1 = document.createElement('div');
                showcase1.className = 'showcase-circle showcase-circle-1';
                showcase1.innerHTML = '<div class="showcase-content">Showcase 1</div>';
                
                const showcase2 = document.createElement('div');
                showcase2.className = 'showcase-circle showcase-circle-2';
                showcase2.innerHTML = '<div class="showcase-content">Showcase 2</div>';
                
                modalCard.appendChild(showcase1);
                modalCard.appendChild(showcase2);
            }
            

            modalOverlay.style.display = "flex";
            anime({
                targets: modalCard,
                scale: [0, 1],
                opacity: [0, 1],
                duration: 500,
                easing: 'easeOutQuad',
                complete: () => { isModalOpen = true; }
            });
        });
    });
    
    // Modal close button handler
    closeBtn.addEventListener('click', () => {
        modalCard.classList.remove('open');
        anime({
            targets: modalCard,
            scale: 0,
            opacity: 0,
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                modalOverlay.style.display = "none";
                isModalOpen = false;
            }
        });
    });
    var TxtRotate = function(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
      };
      
      TxtRotate.prototype.tick = function() {
        var i = this.loopNum % this.toRotate.length;
        var fullTxt = this.toRotate[i];
      
        if (this.isDeleting) {
          this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
          this.txt = fullTxt.substring(0, this.txt.length + 1);
        }
      
        this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';
      
        var that = this;
        var delta = 300 - Math.random() * 100;
      
        if (this.isDeleting) { delta /= 2; }
      
        if (!this.isDeleting && this.txt === fullTxt) {
          delta = this.period;
          this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
          this.isDeleting = false;
          this.loopNum++;
          delta = 500;
        }
      
        setTimeout(function() {
          that.tick();
        }, delta);
      };
      
      window.onload = function() {
        var elements = document.getElementsByClassName('txt-rotate');
        for (var i=0; i<elements.length; i++) {
          var toRotate = elements[i].getAttribute('data-rotate');
          var period = elements[i].getAttribute('data-period');
          if (toRotate) {
            new TxtRotate(elements[i], JSON.parse(toRotate), period);
          }
        }
        // INJECT CSS
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = ".txt-rotate > .wrap { border-right: 0.08em solid #9b3cb8 }";
        document.body.appendChild(css);
      };
});
