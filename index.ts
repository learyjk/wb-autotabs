import gsap from "gsap"

const init = async () => {
    const CURRENT_CLASS = ".w--current"

    const tabsComponent = document.querySelector('[wb-autotabs="component"]')
    if (!tabsComponent) {
        console.error('no tabsComponent component found')
        return
    };
    const tabLinks = tabsComponent.querySelectorAll('a')
    const tabVideos = tabsComponent.querySelectorAll('video')

    let currentIndex = parseInt(tabsComponent.querySelector<HTMLAnchorElement>(CURRENT_CLASS)?.getAttribute('data-w-tab')?.slice(-1) || "1", 10) - 1
    let tabTimeout;
    let tween;

    const getNextTabIndex = () => {
        if (currentIndex === tabLinks.length - 1) {
            return 0
        } else {
            return currentIndex + 1
        }
    }

    const animateLoader = (loader: HTMLDivElement, duration: number) => {
        let width = getComputedStyle(loader).width
        let height = getComputedStyle(loader).height
        if (width === "0px") {
            //animate width
            tween = gsap.fromTo(loader, { width: "0%" }, {
                width: "100%", ease: "none", duration, onComplete: () => {
                    gsap.set(loader, { width: "0%" })
                }
            })
        }
        if (height === "0px") {
            //animate height
            tween = gsap.fromTo(loader, { height: "0%" }, {
                height: "100%", ease: "none", duration, onComplete: () => {
                    gsap.set(loader, { height: "0%" })
                }
            })
        }
    }

    const autoPlayTabs = () => {
        console.log({ currentIndex })
        const duration = tabVideos[currentIndex]?.duration || 5
        const loader = tabLinks[currentIndex].querySelector('[wb-autotabs="loader"]')
        if (loader) {
            animateLoader(loader as HTMLDivElement, duration);
        }
        console.log({ duration })
        tabVideos[currentIndex].currentTime = 0

        tabTimeout = setTimeout(() => {
            let nextIndex = getNextTabIndex()
            currentIndex = nextIndex
            tabLinks[nextIndex].click()
        }, duration * 1000)
    }


    // Select the node that will be observed for mutations
    const targetNode = tabsComponent;

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, subtree: true, attributeFilter: ['class'] };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (mutation.target.className.includes('w--current')) {
                    //console.log('active tab is: ', mutation.target)
                    gsap.to(tabLinks[currentIndex].querySelector('[wb-autotabs="loader"]'), { height: "0%", duration: 0.2 });
                    tween.kill()
                    clearTimeout(tabTimeout)
                    currentIndex = parseInt(tabsComponent.querySelector<HTMLAnchorElement>(CURRENT_CLASS)?.getAttribute('data-w-tab')?.slice(-1) || "1", 10) - 1
                    autoPlayTabs()
                }
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    // Execute initial
    autoPlayTabs()

}

window.addEventListener("load", init)