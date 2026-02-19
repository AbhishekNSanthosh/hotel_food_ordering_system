import Link from "next/link";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <main className="container mx-auto px-4 py-8 flex-1">
        <Link
          href="/"
          className="inline-block mb-6 text-primary hover:underline"
        >
          &larr; Back to Menu
        </Link>
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">1. Terms</h2>
            <p className="mb-2">
              By accessing this website, you are agreeing to be bound by these
              website Terms and Conditions of Use, all applicable laws and
              regulations, and agree that you are responsible for compliance
              with any applicable local laws.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">2. Use License</h2>
            <p className="mb-2">
              Permission is granted to temporarily view the materials
              (information or software) on Hotel Food Ordering's website for
              personal, non-commercial transitory viewing only.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">3. Disclaimer</h2>
            <p className="mb-2">
              The materials on Hotel Food Ordering's website are provided "as
              is". Hotel Food Ordering makes no warranties, expressed or
              implied, and hereby disclaims and negates all other warranties,
              including without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
