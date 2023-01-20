import gsap from "gsap";

const init = async () => {
  const CURRENT_CLASS = ".w--current";

  const tabsComponents = document.querySelectorAll('[wb-autotabs="component"]');

  tabsComponents.forEach((tabsComponent) => {
    if (!tabsComponent) {
      console.error("no tabsComponent component found");
      return;
    }

    const tabLinks = tabsComponent.querySelector(".w-tab-menu")
      ?.childNodes as NodeListOf<HTMLAnchorElement>;
    if (!tabLinks) return;

    // fix for safari scrolling to tab on focus
    if (navigator.userAgent.includes("Safari")) {
      tabLinks.forEach(
        (tabLink) =>
          (tabLink.focus = function () {
            const x = window.scrollX,
              y = window.scrollY;
            const f = () => {
              setTimeout(() => window.scrollTo(x, y), 1);
              tabLink.removeEventListener("focus", f);
            };
            tabLink.addEventListener("focus", f);
            HTMLElement.prototype.focus.apply(this, arguments);
          })
      );
    }

    const tabVideos = tabsComponent.querySelectorAll("video");

    let currentIndex =
      parseInt(
        tabsComponent
          .querySelector<HTMLAnchorElement>(CURRENT_CLASS)
          ?.getAttribute("data-w-tab")
          ?.slice(-1) || "1",
        10
      ) - 1;
    let tabTimeout;
    let tween;
    let loaderDirection = "vertical";

    // get loader
    const l = tabLinks[currentIndex].querySelector('[wb-autotabs="loader"]');
    if (l && getComputedStyle(l).width === "0px") {
      loaderDirection = "horizontal";
    }

    const getNextTabIndex = () => {
      if (currentIndex === tabLinks.length - 1) {
        return 0;
      } else {
        return currentIndex + 1;
      }
    };

    const animateLoader = (loader: HTMLDivElement, duration: number) => {
      if (loaderDirection === "horizontal") {
        //animate width
        tween = gsap.fromTo(
          loader,
          { width: "0%" },
          {
            width: "100%",
            ease: "none",
            duration,
            onComplete: () => {
              gsap.set(loader, { width: "0%" });
            },
          }
        );
      }
      if (loaderDirection === "vertical") {
        //animate height
        tween = gsap.fromTo(
          loader,
          { height: "0%" },
          {
            height: "100%",
            ease: "none",
            duration,
            onComplete: () => {
              gsap.set(loader, { height: "0%" });
            },
          }
        );
      }
    };

    const autoPlayTabs = () => {
      //console.log({ currentIndex })
      const duration = tabVideos[currentIndex]?.duration || 5;
      //console.log({ duration })
      const loader = (tabLinks[currentIndex] as Element).querySelector(
        '[wb-autotabs="loader"]'
      );
      if (loader) {
        animateLoader(loader as HTMLDivElement, duration);
      }
      //console.log({ duration })
      tabVideos[currentIndex].currentTime = 0;

      tabTimeout = setTimeout(() => {
        let nextIndex = getNextTabIndex();
        tabLinks[nextIndex].click();
      }, duration * 1000);
    };

    // Select the node that will be observed for mutations
    const targetNode = tabsComponent;

    // Options for the observer (which mutations to observe)
    const config = {
      attributes: true,
      subtree: true,
      attributeFilter: ["class"],
    };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
      for (const mutation of mutationList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          if (mutation.target.className.includes("w--current")) {
            //console.log('active tab is: ', mutation.target)
            const loader = tabLinks[currentIndex].querySelector(
              '[wb-autotabs="loader"]'
            );
            if (!!loader) {
              gsap.set(
                loader,
                loaderDirection === "horizontal"
                  ? { width: "0%" }
                  : { height: "0%" }
              );
            }
            if (tween) {
              tween.kill();
            }
            clearTimeout(tabTimeout);
            currentIndex =
              parseInt(
                tabsComponent
                  .querySelector<HTMLAnchorElement>(CURRENT_CLASS)
                  ?.getAttribute("data-w-tab")
                  ?.slice(-1) || "1",
                10
              ) - 1;
            autoPlayTabs();
          }
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    // Execute initial
    autoPlayTabs();
  });
};

window.addEventListener("load", init);
