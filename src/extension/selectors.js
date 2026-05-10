export const platformSelectors = {
  amazon: {
    domains: ['amazon.com', 'amazon.co.uk', 'amazon.in', 'amazon.ae', 'amazon.ca'],
    container: '.a-section.review',
    text: '.review-text-content',
    author: '.a-profile-name',
    rating: '.a-icon-alt',
    injectPoint: '.review-comments',
    replyTextarea: 'textarea[placeholder*="comment"], .comment-form-textarea'
  },
  etsy: {
    domains: ['etsy.com'],
    container: '.wt-grid__item-xs-12',
    text: '.wt-text-body-01',
    author: '.shop-owner-name',
    injectPoint: '.wt-grid__item-xs-12',
    replyTextarea: 'textarea.wt-textarea'
  },
  shopify: {
    domains: ['myshopify.com'],
    container: '.spr-review',
    text: '.spr-review-content-body',
    author: '.spr-review-header-byline',
    injectPoint: '.spr-review-footer',
    replyTextarea: '.spr-form-input-textarea'
  },
  daraz: {
    domains: ['daraz.pk', 'daraz.com.bd', 'daraz.com.np', 'daraz.lk'],
    container: '.item-content',
    text: '.content',
    author: '.user',
    injectPoint: '.item-content',
    replyTextarea: 'textarea.reply-input'
  }
};

export const getPlatform = () => {
  const host = window.location.hostname;
  if (host.includes('amazon')) return 'amazon';
  if (host.includes('etsy')) return 'etsy';
  if (host.includes('shopify') || document.querySelector('.spr-review')) return 'shopify';
  if (host.includes('daraz')) return 'daraz';
  return null;
};
