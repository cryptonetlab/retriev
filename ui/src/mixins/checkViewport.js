export default {
  data() {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: false,
    };
  },
  async mounted() {
    this.checkViewport();
  },
  methods: {
    checkViewport() {
      const app = this;
      if (window.innerWidth < 768) {
        app.isMobile = true;
        app.isTablet = false;
        app.isDesktop = false;
        app.isDesktopMedium = false;
      } else if (window.innerWidth < 992 && window.innerWidth > 768) {
        app.isMobile = false;
        app.isTablet = true;
        app.isDesktop = false;
        app.isDesktopMedium = false;
      } else if (window.innerWidth > 992) {
        app.isMobile = false;
        app.isTablet = false;
        app.isDesktop = true;
        app.isDesktopMedium = false;
      } else if (window.innerWidth > 1441 && window.innerWidth < 1561) {
        app.isMobile = false;
        app.isTablet = false;
        app.isDesktop = true;
        app.isDesktopMedium = true;
      }

      window.addEventListener("resize", function () {
        if (window.innerWidth < 768) {
          app.isMobile = true;
          app.isTablet = false;
          app.isDesktop = false;
          app.isDesktopMedium = false;
        } else if (window.innerWidth < 992 && window.innerWidth > 768) {
          app.isMobile = false;
          app.isTablet = true;
          app.isDesktop = false;
          app.isDesktopMedium = false;
        } else if (window.innerWidth > 992) {
          app.isMobile = false;
          app.isTablet = false;
          app.isDesktop = true;
          app.isDesktopMedium = false;
        } else if (window.innerWidth > 1441 && window.innerWidth < 1561) {
          app.isMobile = false;
          app.isTablet = false;
          app.isDesktop = true;
          app.isDesktopMedium = true;
        }
      });
    },
  },
};
