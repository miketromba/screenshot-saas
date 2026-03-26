import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'WordPress Screenshot API Integration — Shortcodes, REST API & Transient Caching',
	description:
		'Add website screenshots to WordPress with shortcodes, a custom REST API endpoint, and transient caching. Copy-paste PHP plugin code for WordPress.'
}

export default function WordPressIntegrationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Integrations', href: '/integrations' },
				{ label: 'WordPress' }
			]}
			title="WordPress Screenshot API Integration"
			description="Embed live website screenshots in WordPress posts and pages with a shortcode, expose a custom REST API endpoint, and cache results with WordPress transients."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: 'WordPress Screenshot API Integration',
				description:
					'How to capture website screenshots in WordPress with shortcodes and transient caching.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Can I use this without a plugin?',
					answer: "Yes. Add the code to your theme's functions.php file or create a simple must-use plugin by placing the file in wp-content/mu-plugins/. No plugin activation needed."
				},
				{
					question: 'How do I add my API key in WordPress?',
					answer: "Define it in wp-config.php as a constant: define('SCREENSHOTAPI_KEY', 'sk_live_xxxxx');. Never store API keys in the database where they could be exposed."
				},
				{
					question: 'How long are screenshots cached?',
					answer: 'The transient cache defaults to 1 hour. Adjust the HOUR_IN_SECONDS value to cache longer (e.g., DAY_IN_SECONDS for 24 hours). Transients are stored in the database or object cache.'
				},
				{
					question: 'Does this work with block themes?',
					answer: 'Yes. The shortcode works in Classic and Block themes. You can also create a custom Gutenberg block that wraps the screenshot functionality for a better editor experience.'
				},
				{
					question: 'Will this slow down my WordPress site?',
					answer: 'Not with caching enabled. The first load captures and caches the screenshot. Subsequent page views serve from cache with no API call, adding zero latency.'
				}
			]}
			relatedPages={[
				{
					title: 'Laravel Integration',
					description:
						'PHP framework integration with queued jobs and caching.',
					href: '/integrations/laravel'
				},
				{
					title: 'Cloudflare Workers Integration',
					description:
						'Edge-deployed screenshot service with KV caching.',
					href: '/integrations/cloudflare-workers'
				},
				{
					title: 'Next.js Integration',
					description:
						'Headless WordPress + Next.js screenshot integration.',
					href: '/integrations/nextjs'
				}
			]}
		>
			{/* Quick Start */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Quick start
				</h2>
				<p className="mt-3 text-muted-foreground">
					Add your API key to <code>wp-config.php</code> and create a
					must-use plugin. No plugin activation or settings page
					needed.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="php"
						title="wp-config.php"
						code={`// Add before "That's all, stop editing!"
define('SCREENSHOTAPI_KEY', 'sk_live_xxxxx');`}
					/>
				</div>
			</section>

			{/* Shortcode */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Screenshot shortcode
				</h2>
				<p className="mt-3 text-muted-foreground">
					A shortcode that embeds a live screenshot anywhere in your
					WordPress content. Use it in posts, pages, or widgets:{' '}
					<code>
						[screenshot url=&quot;https://example.com&quot;]
					</code>
					.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="php"
						title="wp-content/mu-plugins/screenshotapi.php"
						code={`<?php
/**
 * Plugin Name: ScreenshotAPI Integration
 * Description: Embed website screenshots via shortcode and REST API.
 */

defined('ABSPATH') || exit;

function screenshotapi_capture($url, $args = []) {
    $defaults = [
        'width'    => 1440,
        'height'   => 900,
        'type'     => 'png',
        'fullPage' => 'false',
        'quality'  => '85',
    ];
    $args = wp_parse_args($args, $defaults);

    $cache_key = 'screenshot_' . md5($url . serialize($args));
    $cached = get_transient($cache_key);
    if ($cached !== false) {
        return $cached;
    }

    $api_url = add_query_arg(
        array_merge(['url' => $url], $args),
        'https://screenshotapi.to/api/v1/screenshot'
    );

    $response = wp_remote_get($api_url, [
        'headers' => ['x-api-key' => SCREENSHOTAPI_KEY],
        'timeout' => 30,
    ]);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return null;
    }

    $body = wp_remote_retrieve_body($response);
    $content_type = wp_remote_retrieve_header($response, 'content-type');
    $data_uri = 'data:' . $content_type . ';base64,' . base64_encode($body);

    set_transient($cache_key, $data_uri, HOUR_IN_SECONDS);

    return $data_uri;
}

function screenshotapi_shortcode($atts) {
    $atts = shortcode_atts([
        'url'       => '',
        'width'     => 1440,
        'height'    => 900,
        'type'      => 'png',
        'fullpage'  => 'false',
        'alt'       => '',
        'class'     => 'screenshotapi-image',
    ], $atts, 'screenshot');

    if (empty($atts['url'])) {
        return '<!-- ScreenshotAPI: Missing url attribute -->';
    }

    $image = screenshotapi_capture($atts['url'], [
        'width'    => $atts['width'],
        'height'   => $atts['height'],
        'type'     => $atts['type'],
        'fullPage' => $atts['fullpage'],
    ]);

    if (!$image) {
        return '<p class="screenshotapi-error">Unable to capture screenshot.</p>';
    }

    $alt = esc_attr($atts['alt'] ?: 'Screenshot of ' . $atts['url']);
    $class = esc_attr($atts['class']);

    return sprintf(
        '<img src="%s" alt="%s" class="%s" loading="lazy" />',
        esc_attr($image),
        $alt,
        $class
    );
}
add_shortcode('screenshot', 'screenshotapi_shortcode');`}
					/>
				</div>
				<div className="mt-4">
					<CodeBlock
						language="text"
						title="Shortcode usage in posts/pages"
						code={`[screenshot url="https://github.com"]

[screenshot url="https://vercel.com" width="1200" height="630" type="webp"]

[screenshot url="https://nextjs.org" fullpage="true" class="my-custom-class"]`}
					/>
				</div>
			</section>

			{/* REST API Endpoint */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					WP REST API endpoint
				</h2>
				<p className="mt-3 text-muted-foreground">
					Expose a REST API endpoint so JavaScript, external tools, or
					other WordPress plugins can request screenshots
					programmatically.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="php"
						title="wp-content/mu-plugins/screenshotapi.php (continued)"
						code={`function screenshotapi_register_rest_route() {
    register_rest_route('screenshotapi/v1', '/capture', [
        'methods'             => 'GET',
        'callback'            => 'screenshotapi_rest_capture',
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        },
        'args' => [
            'url' => [
                'required'          => true,
                'validate_callback' => function ($value) {
                    return filter_var($value, FILTER_VALIDATE_URL) !== false;
                },
            ],
            'width'  => ['default' => 1440, 'type' => 'integer'],
            'height' => ['default' => 900,  'type' => 'integer'],
            'type'   => ['default' => 'png', 'enum' => ['png', 'jpeg', 'webp']],
        ],
    ]);
}
add_action('rest_api_init', 'screenshotapi_register_rest_route');

function screenshotapi_rest_capture($request) {
    $image = screenshotapi_capture($request->get_param('url'), [
        'width'  => $request->get_param('width'),
        'height' => $request->get_param('height'),
        'type'   => $request->get_param('type'),
    ]);

    if (!$image) {
        return new WP_Error(
            'capture_failed',
            'Unable to capture screenshot',
            ['status' => 502]
        );
    }

    return rest_ensure_response([
        'url'       => $request->get_param('url'),
        'image'     => $image,
        'cached'    => get_transient('screenshot_' . md5($request->get_param('url') . serialize([
            'width'  => $request->get_param('width'),
            'height' => $request->get_param('height'),
            'type'   => $request->get_param('type'),
        ]))) !== false,
    ]);
}`}
					/>
				</div>
			</section>

			{/* Admin Settings */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Cache management
				</h2>
				<p className="mt-3 text-muted-foreground">
					Add helper functions to clear the screenshot cache when
					needed, either for a specific URL or all cached screenshots
					at once.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="php"
						title="Cache helpers"
						code={`function screenshotapi_clear_cache($url = null) {
    global $wpdb;

    if ($url) {
        $cache_key = 'screenshot_' . md5($url);
        delete_transient($cache_key);
        return;
    }

    $wpdb->query(
        "DELETE FROM {$wpdb->options}
         WHERE option_name LIKE '_transient_screenshot_%'
         OR option_name LIKE '_transient_timeout_screenshot_%'"
    );
}

// Clear cache via WP-CLI: wp eval 'screenshotapi_clear_cache();'
// Clear single URL: wp eval 'screenshotapi_clear_cache("https://example.com");'`}
					/>
				</div>
			</section>

			{/* Production Tips */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Production tips
				</h2>
				<ul className="mt-4 space-y-3 text-muted-foreground">
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Use an object cache.
							</strong>{' '}
							Install Redis Object Cache or Memcached to store
							transients in memory instead of the database for
							faster cache hits.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Store in wp-config.php.
							</strong>{' '}
							Never store your API key in the WordPress options
							table. Define it as a PHP constant in{' '}
							<code>wp-config.php</code>.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Restrict REST endpoint access.
							</strong>{' '}
							The example requires <code>edit_posts</code>{' '}
							capability. Adjust the permission callback to match
							your security requirements.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Save to Media Library.
							</strong>{' '}
							For persistent storage, download the image and
							insert it into the WordPress Media Library using{' '}
							<code>wp_insert_attachment()</code>.
						</span>
					</li>
				</ul>
			</section>
		</ArticleLayout>
	)
}
