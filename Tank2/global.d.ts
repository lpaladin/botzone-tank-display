declare const TweenMax: typeof gsap.TweenMax;
declare const TimelineMax: typeof gsap.TimelineMax;
declare type TweenMax = gsap.TweenMax;
declare type TimelineMax = gsap.TimelineMax;
declare const Ease: typeof gsap.Ease;
declare const Expo: typeof gsap.Expo;
declare const Linear: typeof gsap.Linear;
declare const Back: typeof gsap.Back;
declare const Quad: typeof gsap.Quad;
interface Window {
    TweenMax?: typeof gsap.TweenMax;
    TimelineMax?: typeof gsap.TimelineMax;
    Ease?: typeof gsap.Ease;
    Expo?: typeof gsap.Expo;
    Linear?: typeof gsap.Linear;
    Back?: typeof gsap.Back;
    Quad?: typeof gsap.Quad;
}

interface ITickable {
    onTick: () => void;
}