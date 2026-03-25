require "net/http"
require "uri"
require "json"

module ScreenshotAPI
  class Client
    def initialize(api_key, base_url: DEFAULT_BASE_URL, timeout: DEFAULT_TIMEOUT)
      raise ArgumentError, "API key is required" if api_key.nil? || api_key.empty?

      @api_key = api_key
      @base_url = base_url.chomp("/")
      @timeout = timeout
    end

    def screenshot(**options)
      raise ArgumentError, "URL is required" unless options[:url]

      uri = build_uri(options)

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      http.open_timeout = @timeout
      http.read_timeout = @timeout

      request = Net::HTTP::Get.new(uri)
      request["x-api-key"] = @api_key

      response = http.request(request)

      unless response.is_a?(Net::HTTPSuccess)
        handle_error(response)
      end

      metadata = Metadata.new(
        credits_remaining: response["x-credits-remaining"].to_i,
        screenshot_id: response["x-screenshot-id"] || "",
        duration_ms: response["x-duration-ms"].to_i
      )

      Result.new(
        image: response.body,
        content_type: response["content-type"] || "image/png",
        metadata: metadata
      )
    end

    def save(path:, **options)
      result = screenshot(**options)
      File.binwrite(path, result.image)
      result.metadata
    end

    private

    def build_uri(options)
      params = { url: options[:url] }
      params[:width] = options[:width] if options[:width]
      params[:height] = options[:height] if options[:height]
      params[:fullPage] = options[:full_page].to_s if options.key?(:full_page)
      params[:type] = options[:type] if options[:type]
      params[:quality] = options[:quality] if options[:quality]
      params[:colorScheme] = options[:color_scheme] if options[:color_scheme]
      params[:waitUntil] = options[:wait_until] if options[:wait_until]
      params[:waitForSelector] = options[:wait_for_selector] if options[:wait_for_selector]
      params[:delay] = options[:delay] if options[:delay]

      uri = URI("#{@base_url}/api/v1/screenshot")
      uri.query = URI.encode_www_form(params)
      uri
    end

    def handle_error(response)
      body = begin
        JSON.parse(response.body)
      rescue JSON::ParserError
        { "error" => "HTTP #{response.code}" }
      end

      message = body["error"] || body["message"] || "Unknown error"

      case response.code.to_i
      when 401
        raise AuthenticationError, message
      when 402
        raise InsufficientCreditsError.new(message, balance: body["balance"].to_i)
      when 403
        raise InvalidAPIKeyError, message
      when 500
        raise ScreenshotFailedError, (body["message"] || message)
      else
        raise APIError.new(message, status: response.code.to_i, code: "unknown_error")
      end
    end
  end
end
