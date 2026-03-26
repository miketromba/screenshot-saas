---
title: "WordPress Screenshot API Integration"
description: "Add website screenshots to WordPress with ScreenshotAPI. Use shortcodes, REST API endpoints, or custom blocks. No plugins required."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: WordPress
faq:
  - question: "Do I need a WordPress plugin to use ScreenshotAPI?"
    answer: "No. You can integrate ScreenshotAPI directly with a few lines of PHP in your theme's functions.php or in a custom plugin. No third-party plugin is required."
  - question: "Can I use ScreenshotAPI with WordPress shortcodes?"
    answer: "Yes. Register a shortcode that calls ScreenshotAPI and outputs an img tag. Use it in posts and pages like [screenshot url='https://example.com']."
  - question: "Does ScreenshotAPI work on shared hosting?"
    answer: "Yes. The API only requires outbound HTTP access from PHP, which is available on virtually every WordPress host. No Chromium or Node.js installation needed."
  - question: "How do I cache screenshots in WordPress?"
    answer: "Use WordPress transients to cache the image URL or bytes. Set an expiration time to refresh screenshots periodically without burning extra credits."
  - question: "Can I save screenshots to the WordPress media library?"
    answer: "Yes. Download the image bytes from ScreenshotAPI and use wp_upload_bits followed by wp_insert_attachment to add the screenshot as a media library item."
relatedPages:
  - title: "Laravel Integration"
    description: "PHP screenshot integration for Laravel applications"
    href: "/integrations/laravel"
  - title: "PHP SDK"
    description: "Full reference for the ScreenshotAPI PHP SDK"
    href: "/docs/sdks/php"
  - title: "OG Image Generation"
    description: "Generate social sharing images for WordPress posts"
    href: "/use-cases/og-image-generation"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "WordPress Screenshot API Integration"
  description: "Add website screenshots to WordPress with ScreenshotAPI. Use shortcodes, REST API endpoints, or custom blocks."
  dateModified: "2026-03-25"
---

## Add Website Screenshots to WordPress with ScreenshotAPI

WordPress powers over 40% of the web, and many site owners need to display website previews, link thumbnails, or portfolio screenshots. Existing plugins like Urlbox Screenshots and Capture require paid subscriptions to external services and offer limited customization. Other approaches involving local browser automation are not feasible on shared hosting.

A **WordPress screenshot API** integration with ScreenshotAPI gives you full control. Add a shortcode, a REST endpoint, or a Gutenberg block with a few lines of PHP. It works on any WordPress host, from shared plans to dedicated servers, because the only requirement is outbound HTTP access.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and get your API key. **5 free credits** are included.
2. Add the API key to your `wp-config.php`.
3. Register a shortcode or REST endpoint in your theme or plugin.

## Installation

Add your API key to `wp-config.php`:

```php
define('SCREENSHOTAPI_KEY', 'sk_live_xxxxx');
```

No plugin installation is needed. All code goes in your theme's `functions.php` or in a custom plugin file.

## Basic Example: Shortcode

Register a `[screenshot]` shortcode that displays a website thumbnail:

```php
// functions.php or custom plugin
function screenshotapi_shortcode($atts) {
    $atts = shortcode_atts([
        'url'    => '',
        'width'  => 1440,
        'height' => 900,
        'type'   => 'webp',
        'alt'    => 'Website screenshot',
    ], $atts);

    if (empty($atts['url'])) {
        return '<p>Error: URL is required</p>';
    }

    $cache_key = 'screenshot_' . md5($atts['url'] . $atts['width'] . $atts['height']);
    $cached_url = get_transient($cache_key);

    if ($cached_url !== false) {
        return sprintf(
            '<img src="%s" alt="%s" loading="lazy" style="max-width:100%%;height:auto;" />',
            esc_url($cached_url),
            esc_attr($atts['alt'])
        );
    }

    $api_url = add_query_arg([
        'url'    => $atts['url'],
        'width'  => $atts['width'],
        'height' => $atts['height'],
        'type'   => $atts['type'],
    ], 'https://screenshotapi.to/api/v1/screenshot');

    $response = wp_remote_get($api_url, [
        'headers' => ['x-api-key' => SCREENSHOTAPI_KEY],
        'timeout' => 30,
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return '<p>Screenshot unavailable</p>';
    }

    $image_data = wp_remote_retrieve_body($response);
    $upload = wp_upload_bits("screenshot-{$cache_key}.{$atts['type']}", null, $image_data);

    if ($upload['error']) {
        return '<p>Screenshot upload failed</p>';
    }

    set_transient($cache_key, $upload['url'], HOUR_IN_SECONDS);

    return sprintf(
        '<img src="%s" alt="%s" loading="lazy" style="max-width:100%%;height:auto;" />',
        esc_url($upload['url']),
        esc_attr($atts['alt'])
    );
}
add_shortcode('screenshot', 'screenshotapi_shortcode');
```

Use it in any post or page:

```
[screenshot url="https://example.com" width="1280" height="800"]
```

## WordPress REST API Endpoint

Add a custom REST endpoint for programmatic access:

```php
add_action('rest_api_init', function () {
    register_rest_route('screenshotapi/v1', '/capture', [
        'methods'  => 'GET',
        'callback' => 'screenshotapi_rest_capture',
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        },
        'args' => [
            'url' => [
                'required' => true,
                'validate_callback' => function ($param) {
                    return filter_var($param, FILTER_VALIDATE_URL);
                },
            ],
            'width'  => ['default' => 1440, 'type' => 'integer'],
            'height' => ['default' => 900, 'type' => 'integer'],
            'type'   => ['default' => 'png', 'enum' => ['png', 'jpeg', 'webp']],
        ],
    ]);
});

function screenshotapi_rest_capture($request) {
    $api_url = add_query_arg([
        'url'    => $request->get_param('url'),
        'width'  => $request->get_param('width'),
        'height' => $request->get_param('height'),
        'type'   => $request->get_param('type'),
    ], 'https://screenshotapi.to/api/v1/screenshot');

    $response = wp_remote_get($api_url, [
        'headers' => ['x-api-key' => SCREENSHOTAPI_KEY],
        'timeout' => 30,
    ]);

    if (is_wp_error($response)) {
        return new WP_Error('capture_failed', 'Screenshot capture failed', ['status' => 502]);
    }

    $code = wp_remote_retrieve_response_code($response);
    if ($code !== 200) {
        return new WP_Error('api_error', "API returned {$code}", ['status' => $code]);
    }

    $type = $request->get_param('type');
    $body = wp_remote_retrieve_body($response);

    header("Content-Type: image/{$type}");
    header('Cache-Control: public, max-age=3600');
    echo $body;
    exit;
}
```

## Screenshot Helper Class

Organize your screenshot logic in a class for cleaner code:

```php
class ScreenshotAPI_Client {
    private string $api_key;
    private string $api_base = 'https://screenshotapi.to/api/v1/screenshot';

    public function __construct(string $api_key = '') {
        $this->api_key = $api_key ?: SCREENSHOTAPI_KEY;
    }

    public function capture(array $options): string|WP_Error {
        $defaults = [
            'width'     => 1440,
            'height'    => 900,
            'type'      => 'webp',
            'waitUntil' => 'networkidle',
        ];
        $params = array_merge($defaults, $options);

        $api_url = add_query_arg($params, $this->api_base);

        $response = wp_remote_get($api_url, [
            'headers' => ['x-api-key' => $this->api_key],
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code($response);
        if ($code !== 200) {
            return new WP_Error('api_error', "ScreenshotAPI returned {$code}");
        }

        return wp_remote_retrieve_body($response);
    }

    public function capture_cached(array $options, int $ttl = 3600): string|WP_Error {
        $cache_key = 'ssapi_' . md5(serialize($options));
        $cached = get_transient($cache_key);

        if ($cached !== false) {
            return $cached;
        }

        $result = $this->capture($options);
        if (is_wp_error($result)) {
            return $result;
        }

        set_transient($cache_key, $result, $ttl);
        return $result;
    }
}
```

## Saving to the Media Library

Store screenshots as proper WordPress media attachments:

```php
function screenshotapi_save_to_media_library(string $image_data, string $filename): int|WP_Error {
    $upload = wp_upload_bits($filename, null, $image_data);

    if ($upload['error']) {
        return new WP_Error('upload_failed', $upload['error']);
    }

    $file_type = wp_check_filetype($filename);

    $attachment = [
        'post_mime_type' => $file_type['type'],
        'post_title'     => sanitize_file_name($filename),
        'post_content'   => '',
        'post_status'    => 'inherit',
    ];

    $attach_id = wp_insert_attachment($attachment, $upload['file']);

    if (is_wp_error($attach_id)) {
        return $attach_id;
    }

    require_once ABSPATH . 'wp-admin/includes/image.php';
    $attach_data = wp_generate_attachment_metadata($attach_id, $upload['file']);
    wp_update_attachment_metadata($attach_id, $attach_data);

    return $attach_id;
}
```

Usage:

```php
$client = new ScreenshotAPI_Client();
$image = $client->capture(['url' => 'https://example.com']);

if (!is_wp_error($image)) {
    $attachment_id = screenshotapi_save_to_media_library($image, 'example-screenshot.webp');
    $url = wp_get_attachment_url($attachment_id);
}
```

## Automatic Featured Images

Automatically set a screenshot as the featured image for posts with a URL custom field:

```php
add_action('save_post', function ($post_id) {
    if (wp_is_post_revision($post_id) || get_post_type($post_id) !== 'post') {
        return;
    }

    $url = get_post_meta($post_id, 'external_url', true);
    if (empty($url) || has_post_thumbnail($post_id)) {
        return;
    }

    $client = new ScreenshotAPI_Client();
    $image = $client->capture([
        'url'    => $url,
        'width'  => 1200,
        'height' => 630,
        'type'   => 'webp',
    ]);

    if (is_wp_error($image)) {
        return;
    }

    $attachment_id = screenshotapi_save_to_media_library(
        $image,
        "featured-{$post_id}.webp"
    );

    if (!is_wp_error($attachment_id)) {
        set_post_thumbnail($post_id, $attachment_id);
    }
});
```

## Production Tips

### Caching Strategy

WordPress transients are the simplest caching mechanism:

- Use `set_transient()` with a TTL matching your freshness requirements.
- For high-traffic sites, ensure transients are backed by an object cache (Redis or Memcached) rather than the database.

### Security

Always validate user-supplied URLs:

```php
function is_valid_screenshot_url(string $url): bool {
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return false;
    }
    $scheme = parse_url($url, PHP_URL_SCHEME);
    return in_array($scheme, ['http', 'https'], true);
}
```

### Performance

Use `wp_remote_get` with a reasonable timeout (30 seconds) and handle errors gracefully. For bulk operations, consider using WordPress cron to process screenshots in batches.

Visit the [pricing page](/pricing) to select the credit tier that fits your WordPress site's needs.

## Further Reading

- The [PHP SDK documentation](/docs/sdks/php) covers the full ScreenshotAPI parameter reference.
- See the [Laravel integration](/integrations/laravel) for a similar PHP integration in a framework context.
- Learn about [OG image generation](/use-cases/og-image-generation) to create social sharing previews for your WordPress content.
