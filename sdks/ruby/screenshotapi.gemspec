Gem::Specification.new do |spec|
  spec.name          = "screenshotapi"
  spec.version       = "1.0.0"
  spec.authors       = ["ScreenshotAPI"]
  spec.email         = ["support@screenshotapi.to"]
  spec.summary       = "Official Ruby SDK for ScreenshotAPI"
  spec.description   = "Capture website screenshots with the ScreenshotAPI service. Simple, fast, and reliable."
  spec.homepage      = "https://screenshotapi.to"
  spec.license       = "MIT"
  spec.required_ruby_version = ">= 3.0.0"

  spec.metadata["homepage_uri"]    = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/miketromba/screenshotapi-ruby"

  spec.files = Dir["lib/**/*.rb"] + ["LICENSE", "README.md"]
  spec.require_paths = ["lib"]
end
