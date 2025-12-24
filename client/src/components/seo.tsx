import { Helmet } from "react-helmet-async";

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: "website" | "article";
}

export function SEO({
    title,
    description = "Train AI on your unique brand voice. Stop sounding robotic and generate consistent, high-converting social media content in seconds.",
    keywords = ["AI Brand Voice Generator", "Ghostwriting AI", "Social Media Content Generator", "BrandVoice", "ourlab", "ourlab fun"],
    image = "/og-image.jpg",
    url = "https://brandvoice.ai",
    type = "website"
}: SEOProps) {

    const siteTitle = "BrandVoice - AI Brand Voice Generator";
    const fullTitle = title === siteTitle ? title : `${title} | BrandVoice`;

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "BrandVoice",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": description,
        "featureList": "AI Brand Voice Training, Content Repurposing, Social Media Ghostwriting"
    };

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords.join(", ")} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
}
