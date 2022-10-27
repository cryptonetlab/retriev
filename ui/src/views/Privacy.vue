<template>
  <div class="terms bg-color-dark">
    <div class="container" style="min-height: 100vh">
      <!-- ====================== NAVBAR ====================== -->
      <div
        class=""
        style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background-color: black;
        "
      >
        <div
          class="container is-flex is-justify-content-space-between py-6"
          :class="{ 'px-5': !isDesktop }"
        >
          <img
            :width="[isMobile ? 40 : 52]"
            src="../assets/img/logo.svg"
            alt=""
          />
          <div class="is-flex is-align-items-center">
            <a
              href="/"
              class="btn-secondary"
              style="text-align: center; text-transform: lowercase"
              :style="[
                isMobile
                  ? { width: '120px', fontSize: '0.8rem' }
                  : { width: '180px', fontSize: '1.2rem' },
              ]"
            >
              Home</a
            >
            <a
              class="btn-primary ml-3"
              href="https://hackmd.io/@irenegia/BkqNihVY5"
              target="_blank"
              style="
                text-align: center;
                text-transform: lowercase;
                font-size: 1.2rem;
              "
              :style="[
                isMobile
                  ? { width: '120px', fontSize: '0.8rem' }
                  : { width: '180px', fontSize: '1.2rem' },
              ]"
            >
              paper
            </a>
          </div>
        </div>
      </div>
      <!-- ====================== NAVBAR ====================== -->

      <div class="px-6" style="padding-top: 160px">
        <div class="pb-6">
          <h4>Privacy Policy</h4>
          <div class="" style="text-align: justify">
            <p class="mt-4">
              This Privacy Policy governs all use of the retriev.org website
              (the “Website”) and all content, services and products available
              at or through the Website (collectively, the “Services”). The
              Services are offered subject to your acceptance without
              modification of all the terms and conditions herein, and all other
              other operating rules, policies (including, without limitation,
              our "Terms of Service") and procedures that may be updated from
              time to time. By accessing or using any part of our Services you
              agree to be bound by the terms and conditions of the Privacy
              Policy. If you do not agree to all of the terms and conditions of
              this Privacy Policy, then you may not access our Services.
            </p>

            <p class="mt-4">
              <b>What information do we collect?</b><br />
              We currently do not collect personal information from the users of
              our Services or our Website. We are a conduit for information
              controlled by others. It is our users who are responsible for the
              user-uploaded and/or community-hosted content transmitted across
              our network (e.g., images, written content, graphics, etc.).
            </p>

            <p class="mt-4">
              <b>Third party links</b><br />
              Occasionally, at our discretion, we may include or offer third
              party products or services on our site. These third party sites
              have separate and independent privacy policies and may collect or
              use your data in a way we are not aware of. We therefore have no
              responsibility or liability for the content and activities of
              these linked sites.
            </p>

            <p class="mt-4">
              <b>Changes to our Privacy Policy</b> <br />If we decide to change
              our Privacy Policy, we will post those changes on this page. This
              document is CC-BY-SA. It was last updated October 21, 2022.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import checkViewport from "../mixins/checkViewport";

export default {
  name: "Privacy",
  mixins: [checkViewport],
  data() {
    return {};
  },
};
</script>
