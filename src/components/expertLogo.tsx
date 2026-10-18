import classNames from '@helpers/string/classNames';
import styles from '@components/expertLogo.module.scss';

// * Expert's mark: a paper plane with three speed lines, drawn as strokes in a 32-unit box
const PLANE = 'M7.14 7.35L23.52 2.30C27.19 1.17 30.84 4.90 29.73 8.65L24.77 25.35C24.17 27.36 22.51 28.43 20.74 28.50C18.97 28.58 17.09 27.67 16.07 25.73L13.07 20.05C12.91 19.74 12.67 19.49 12.37 19.33L6.76 16.23C4.86 15.19 3.97 13.27 4.05 11.46C4.12 9.65 5.17 7.96 7.14 7.35Z';
const SPEED_LINES = ['M4.51 20.52 2.06 23.03', 'M6.35 26.16 3.90 28.66', 'M11.25 28.66 10.03 29.91'];

// The Expert logo: the mark on its tile, in the accent colour. `animated` flies the plane in once,
// when it is shown.
export default function ExpertLogo(props: {class?: string, animated?: boolean}) {
  return (
    <svg
      class={classNames(styles.logo, props.animated && styles.animated, props.class)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 160"
      aria-hidden="true"
    >
      <rect class={styles.tile} width="160" height="160" rx="36" />
      <g
        transform="translate(32 31.4) scale(3.0189)"
        fill="none"
        stroke="#fff"
        stroke-width="4.15"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path class={styles.plane} d={PLANE} />
        {SPEED_LINES.map((d, i) => <path class={styles.speedLine} style={{'--i': i}} d={d} />)}
      </g>
    </svg>
  );
}
