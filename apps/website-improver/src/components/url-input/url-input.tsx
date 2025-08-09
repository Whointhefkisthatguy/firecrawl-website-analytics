'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { urlSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Globe, AlertCircle, CheckCircle } from 'lucide-react';

// Form schema
const urlFormSchema = z.object({
  url: urlSchema,
});

type UrlFormData = z.infer<typeof urlFormSchema>;

interface UrlInputProps {
  onSubmit: (url: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

interface AccessibilityCheckResult {
  accessible: boolean;
  statusCode?: number;
  error?: string;
  responseTime?: number;
}

export function UrlInput({ 
  onSubmit, 
  disabled = false, 
  placeholder = "Enter your website URL (e.g., https://example.com)",
  className = ""
}: UrlInputProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessibilityResult, setAccessibilityResult] = useState<AccessibilityCheckResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<UrlFormData>({
    resolver: zodResolver(urlFormSchema),
    mode: 'onChange',
  });

  const watchedUrl = watch('url');

  // Check URL accessibility
  const checkUrlAccessibility = useCallback(async (url: string): Promise<AccessibilityCheckResult> => {
    try {
      const response = await fetch('/api/v1/url/check-accessibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          accessible: false,
          error: errorData.error?.message || 'Failed to check URL accessibility',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        accessible: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }, []);

  // Handle URL validation and accessibility check
  const handleUrlCheck = useCallback(async () => {
    if (!watchedUrl || !isValid) return;

    setIsChecking(true);
    setAccessibilityResult(null);
    setSubmitError(null);

    try {
      const result = await checkUrlAccessibility(watchedUrl);
      setAccessibilityResult(result);
    } catch (error) {
      setAccessibilityResult({
        accessible: false,
        error: 'Failed to check URL accessibility',
      });
    } finally {
      setIsChecking(false);
    }
  }, [watchedUrl, isValid, checkUrlAccessibility]);

  // Handle form submission
  const handleFormSubmit = async (data: UrlFormData) => {
    if (!accessibilityResult?.accessible) {
      await handleUrlCheck();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(data.url);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to start analysis');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-format URL
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.trim();
    
    // Auto-add https:// if no protocol is specified
    if (value && !value.match(/^https?:\/\//)) {
      value = `https://${value}`;
    }
    
    setValue('url', value);
    trigger('url');
    setAccessibilityResult(null);
    setSubmitError(null);
  };

  const canSubmit = isValid && accessibilityResult?.accessible && !isSubmitting && !disabled;
  const showCheckButton = isValid && !accessibilityResult && !isChecking;
  const showSubmitButton = isValid && accessibilityResult?.accessible;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="url" className="text-sm font-medium">
          Website URL
        </Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="url"
            type="url"
            placeholder={placeholder}
            className="pl-10 pr-4 py-2 text-sm"
            disabled={disabled || isSubmitting}
            {...register('url')}
            onChange={handleUrlChange}
          />
        </div>
        
        {errors.url && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {errors.url.message}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* URL Accessibility Check Results */}
      {accessibilityResult && (
        <Alert variant={accessibilityResult.accessible ? "default" : "destructive"} className="py-3">
          {accessibilityResult.accessible ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className="text-sm">
            {accessibilityResult.accessible ? (
              <div className="space-y-1">
                <div>✅ Website is accessible and ready for analysis</div>
                {accessibilityResult.statusCode && (
                  <div className="text-xs text-gray-600">
                    Status: {accessibilityResult.statusCode} • 
                    Response time: {accessibilityResult.responseTime}ms
                  </div>
                )}
              </div>
            ) : (
              <div>
                ❌ {accessibilityResult.error || 'Website is not accessible'}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Error */}
      {submitError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {submitError}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {showCheckButton && (
          <Button
            type="button"
            variant="outline"
            onClick={handleUrlCheck}
            disabled={isChecking || disabled}
            className="flex-1"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking accessibility...
              </>
            ) : (
              'Check URL'
            )}
          </Button>
        )}

        {showSubmitButton && (
          <Button
            type="submit"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={!canSubmit}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting analysis...
              </>
            ) : (
              'Analyze Website'
            )}
          </Button>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• We'll analyze your website's SEO, performance, and user experience</p>
        <p>• The analysis typically takes 30-60 seconds to complete</p>
        <p>• Make sure your website is publicly accessible</p>
      </div>
    </div>
  );
}