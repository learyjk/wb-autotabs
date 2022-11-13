import gsap from "gsap"

const init = () => {
    console.log("script loaded")
    const CURRENT_CLASS = ".w--current"

    const tabsComponent = document.querySelector('[wb-autotabs="component"]')
    if (!tabsComponent) {
        console.error('no tabsComponent component found')
        return
    };
    const tabLinks = tabsComponent.querySelectorAll('a')
    const tabVideos = tabsComponent.querySelectorAll('video')

    let currentIndex = parseInt(tabsComponent.querySelector<HTMLAnchorElement>(CURRENT_CLASS)?.getAttribute('data-w-tab')?.slice(-1) || "1", 10) - 1

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
            gsap.fromTo(loader, { width: "0%" }, {
                width: "100%", ease: "none", duration, onComplete: () => {
                    gsap.set(loader, { width: "0%" })
                }
            })
        }
        if (height === "0px") {
            //animate height
            gsap.fromTo(loader, { height: "0%" }, {
                height: "100%", ease: "none", duration, onComplete: () => {
                    gsap.set(loader, { height: "0%" })
                }
            })
        }
    }

    const autoPlayTabs = () => {
        //console.log({ currentIndex })
        const duration = tabVideos[currentIndex].duration
        const loader = tabLinks[currentIndex].querySelector('[wb-autotabs="loader"]')
        if (loader) {
            animateLoader(loader as HTMLDivElement, duration);
        }
        //console.log({ duration })
        setTimeout(() => {
            let nextIndex = getNextTabIndex()
            currentIndex = nextIndex
            tabLinks[nextIndex].click()
        }, duration * 1000)
    }
    autoPlayTabs()

    tabLinks.forEach((tabLink) => {
        tabLink.addEventListener("click", () => {
            //clearTimeout(tabTimeout)
            autoPlayTabs()
        })
    })
}

document.addEventListener("DOMContentLoaded", init)