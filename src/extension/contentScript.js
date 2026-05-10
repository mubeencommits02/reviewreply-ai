import { platformSelectors, getPlatform } from './selectors.js';

const platform = getPlatform();
let activeReviewContainer = null;

if (platform) {
  const config = platformSelectors[platform];
  
  const injectAIButtons = () => {
    const reviews = document.querySelectorAll(config.container);
    reviews.forEach(review => {
      if (review.querySelector('.rr-ai-button-container')) return;

      const container = document.createElement('div');
      container.className = 'rr-ai-button-container';
      container.style.marginTop = '10px';
      container.style.marginBottom = '10px';

      const shadow = container.attachShadow({ mode: 'open' });
      const button = document.createElement('button');
      
      // Scoped Styles
      const style = document.createElement('style');
      style.textContent = `
        .rr-btn {
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 12px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
        }
        .rr-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 12px -2px rgba(79, 70, 229, 0.3);
          filter: brightness(1.1);
        }
        .rr-btn:active {
          transform: translateY(0);
        }
        .rr-btn.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;

      button.className = 'rr-btn';
      button.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        <span>Generate AI Reply</span>
      `;

      button.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Mark this review as the active one for the "Insert" feature
        document.querySelectorAll('.rr-active-review').forEach(el => el.classList.remove('rr-active-review'));
        review.classList.add('rr-active-review');
        activeReviewContainer = review;

        const reviewText = review.querySelector(config.text)?.innerText;
        if (!reviewText) return;

        button.classList.add('loading');
        button.innerHTML = '<div class="spinner"></div><span>Thinking...</span>';

        chrome.runtime.sendMessage({
          type: 'PROCESS_REVIEW',
          payload: {
            text: reviewText,
            platform: platform,
            url: window.location.href
          }
        }, () => {
          button.classList.remove('loading');
          button.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            <span>Generate AI Reply</span>
          `;
        });
      };

      shadow.appendChild(style);
      shadow.appendChild(button);
      
      const injectPoint = review.querySelector(config.injectPoint) || review;
      injectPoint.appendChild(container);
    });
  };

  // Initial injection
  injectAIButtons();

  // Optimized MutationObserver with debounce
  let timeout = null;
  const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(injectAIButtons, 500);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Handle messages from Sidepanel (via Background)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'INSERT_REPLY') {
      const target = activeReviewContainer || document.querySelector('.rr-active-review');
      if (!target) return sendResponse({ status: 'no_active_review' });

      const textarea = target.querySelector(config.replyTextarea);
      if (textarea) {
        textarea.value = message.payload.text;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.focus();
        sendResponse({ status: 'success' });
      } else {
        // Fallback: search globally if not found within container
        const globalTextarea = document.querySelector(config.replyTextarea);
        if (globalTextarea) {
          globalTextarea.value = message.payload.text;
          globalTextarea.dispatchEvent(new Event('input', { bubbles: true }));
          globalTextarea.focus();
          sendResponse({ status: 'success' });
        } else {
          sendResponse({ status: 'textarea_not_found' });
        }
      }
    }
  });
}

