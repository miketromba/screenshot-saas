<?php

declare(strict_types=1);

namespace ScreenshotAPI;

class ScreenshotOptions
{
    public function __construct(
        public readonly string $url,
        public readonly ?int $width = null,
        public readonly ?int $height = null,
        public readonly ?bool $fullPage = null,
        public readonly ?string $type = null,
        public readonly ?int $quality = null,
        public readonly ?string $colorScheme = null,
        public readonly ?string $waitUntil = null,
        public readonly ?string $waitForSelector = null,
        public readonly ?int $delay = null,
    ) {}

    /** @return array<string, string> */
    public function toQueryParams(): array
    {
        $params = ['url' => $this->url];

        if ($this->width !== null) {
            $params['width'] = (string) $this->width;
        }
        if ($this->height !== null) {
            $params['height'] = (string) $this->height;
        }
        if ($this->fullPage !== null) {
            $params['fullPage'] = $this->fullPage ? 'true' : 'false';
        }
        if ($this->type !== null) {
            $params['type'] = $this->type;
        }
        if ($this->quality !== null) {
            $params['quality'] = (string) $this->quality;
        }
        if ($this->colorScheme !== null) {
            $params['colorScheme'] = $this->colorScheme;
        }
        if ($this->waitUntil !== null) {
            $params['waitUntil'] = $this->waitUntil;
        }
        if ($this->waitForSelector !== null) {
            $params['waitForSelector'] = $this->waitForSelector;
        }
        if ($this->delay !== null) {
            $params['delay'] = (string) $this->delay;
        }

        return $params;
    }
}
