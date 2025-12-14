<script lang="ts">
  import { CircleAlert, InfoIcon } from "@lucide/svelte";

  import ExtLink from "$lib/components/molecule/ExtLink.svelte";
</script>

<div class="w-full max-w-4xl">
  <div class="text-center mb-8">
    <h1 class="font-bold text-4xl mb-4 text-gray-800">About Website</h1>
  </div>

  <div class="bg-white rounded-lg shadow-lg p-6 space-y-4 mb-4">
    <h2 class="text-2xl font-bold text-gray-800">Website Info</h2>

    <article class="space-y-2 text-gray-600">
      <p>
        GitHub: <ExtLink href="https://github.com/leomotors/chuumai-tools">
          leomotors/chuumai-tools
        </ExtLink>
      </p>

      <p>
        Web Version: {WEB_VERSION} (<ExtLink
          href="https://github.com/leomotors/chuumai-tools/blob/main/apps/chuni-web/CHANGELOG.md"
        >
          Changelog
        </ExtLink>)
      </p>
    </article>

    <div class="prose prose-gray max-w-none">
      <p class="text-gray-600">
        This tool generates rating images for Chunithm players based on their
        play data. Upload your JSON file containing your song records to create
        a personalized rating visualization.
      </p>

      <p class="text-gray-600 font-bold">
        Made with ❤️ by Chunithm players, for Chunithm players.
      </p>
    </div>

    <p>
      Inspired by <ExtLink href="https://reiwa.f5.si">
        https://reiwa.f5.si
      </ExtLink>
    </p>
  </div>

  <!-- About Section -->
  <div class="bg-white rounded-lg shadow-lg p-6 space-y-4 mb-4">
    <div class="flex items-center gap-2">
      <InfoIcon class="w-6 h-6 text-blue-600" />
      <h2 class="text-2xl font-bold text-gray-800">Information Source</h2>
    </div>

    <p>
      Music Information (such as title, artist, level, jacket image) from
      Official Chunithm (JP) Website
    </p>
    <p>
      Chart Constant from <ExtLink href="https://arcade-songs.zetaraku.dev">
        https://arcade-songs.zetaraku.dev
      </ExtLink> (Old Main Source) + Google Sheet from
      <ExtLink href="https://x.com/CHUNITHM_wiki">Chunithm Wiki</ExtLink>
      +
      <ExtLink href="https://chuni-penguin.beerpsi.cc/developer/api/">
        beer-psi's website
      </ExtLink> (will be new main source) and manual
      <ExtLink href="https://www.youtube.com/watch?v=LLjfal8jCYI">
        override
      </ExtLink> sometimes.
    </p>

    <!-- Info Box 2 -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start">
        <InfoIcon class="w-5 h-5 text-blue-400 mt-0.5 mr-3 shrink-0" />
        <div>
          <h3 class="text-sm font-medium text-blue-800 mb-2">Note</h3>
          <div class="text-sm text-blue-700 space-y-2">
            <p>
              This tool is designed for International Version. Data in this
              website might not be up-to-date which can cause problem for
              Japanese Version.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ToS Section -->
  <div class="bg-white rounded-lg shadow-lg p-6 space-y-4 mb-4">
    <div class="flex items-center gap-2">
      <InfoIcon class="w-6 h-6 text-amber-600" />
      <h2 class="text-2xl font-bold text-gray-800">Legal</h2>
    </div>

    <div>
      <h3 class="font-bold text-lg">Terms of Service</h3>

      <article>
        <p class="font-bold">1. Acceptance of Terms</p>
        <p>
          By accessing or using this website (“Service”), you agree to these
          Terms of Service. If you do not agree, do not use the Service.
        </p>

        <p class="font-bold">2. Use of the Service, Warranty and Liability</p>

        <p>
          The Service is provided “as is” and “as available.” We make no
          warranties, express or implied, including accuracy, reliability, or
          suitability of the Service or any data provided.
        </p>
        <p>
          We are not liable for any damages, loses, or issues arising from the
          use of the Service. You are responsible for any activity under your
          use of the Service.
        </p>
        <p>
          The Service displays or relies on data from third-party providers. We
          do not guarantee the accuracy, completeness, or availability of
          third-party data.
        </p>

        <p class="font-bold">3. Usage of this website</p>
        <p>
          You will only use this service for your own personal, non-commerical
          purposes. You will use this service appropriately (i.e. not
          overloading API endpoints or resources). Reminder that you can
          self-host your own instance.
        </p>

        <p class="font-bold">4. Changes to the Service or Terms</p>
        <p>
          We may modify or discontinue any part of the Service at any time. We
          may update these Terms from time to time. Continued use means you
          accept the updated Terms.
        </p>
      </article>

      <h3 class="font-bold text-lg">Privacy Policy</h3>
      <article>
        <p>
          We may collect analytic information which contain any interaction,
          including data you upload to the service to improve the service. (Not
          now, but we reserve the rights to do so in the future)
        </p>
        <p>
          When you sign in and upload your data, your information including User
          ID, data that you upload will be saved in the database and visible to
          website's administrators. We reserve rights to look into those data
          and use it to perform analysis to improve the service.
        </p>
      </article>
    </div>

    <!-- Disclaimer Box -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-start">
        <CircleAlert class="w-5 h-5 text-yellow-400 mt-0.5 mr-3 shrink-0" />
        <div>
          <h3 class="text-sm font-medium text-yellow-800 mb-2">Disclaimer</h3>
          <div class="text-sm text-yellow-700 space-y-2">
            <p>
              This tool is not officially affiliated with SEGA or Chunithm. (I
              think you probably know this already)
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-lg shadow-lg p-6 space-y-4 mb-4">
    <div class="prose max-w-none">
      <p>
        Questions or feedback? Submit a
        <ExtLink href="https://github.com/leomotors/chuumai-tools/issues">
          GitHub Issue
        </ExtLink>
        or contact me via <ExtLink href="https://x.com/LeomotorsTH">X</ExtLink>
      </p>
    </div>
  </div>

  <div class="bg-white rounded-lg shadow-lg p-6 space-y-4 mb-4">
    <h3 class="font-bold text-lg">Miscellaneous</h3>
    <ul class="list-disc list-inside">
      <li>
        <a href="/ui-playground" class="text-blue-500 hover:text-blue-600">
          UI Playground
        </a>
      </li>
    </ul>
  </div>
</div>
