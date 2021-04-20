import * as React from 'react';
import { makeStyles } from '@material-ui/styles';
import TimeManager from './TimeManager';
import { lerp, clamp } from './calc';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    width: 8,
    padding: 8,
    right: 0,
    top: 0,
    cursor: 'pointer',
  },
  inner: {
    backgroundColor: '#aaa',
    width: '100%',
    height: '100%',
    borderRadius: 3,
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.15), 0 6px 20px 0 rgba(0, 0, 0, 0.15)',
    transition: 'background-color 0.5s, box-shadow 0.5s',
  }
}));

interface IScroll {
  children: JSX.Element
  dispatcher?: {
    moveTo: (element: any) => void
    clickDown: boolean
  }
  top?: number
}

const Scroll = (props: IScroll) => {
  const classes = useStyles();
  const scrollRef = React.useRef<HTMLDivElement>();
  const rootRef = React.useRef<HTMLDivElement>();

  const iniTop = 0;

  const isActive = React.useRef<boolean>(false);
  const start = React.useRef<number>(0);
  const current = React.useRef<number>(0);

  const childTopStart = React.useRef<number>(0);
  const childTopEnd = React.useRef<number>(0);
  const childrenLength = React.useRef<number>(0);

  const timer = new TimeManager(0.3);

  const handleMovement = (value: number) => {
    const parentHeight = rootRef.current && rootRef.current.parentElement ? rootRef.current.parentElement.clientHeight : 0;
    const childHeight = rootRef.current && rootRef.current.firstElementChild ? rootRef.current.firstElementChild.clientHeight : 0;
    const scrollHeight = scrollRef.current ? scrollRef.current.clientHeight : 0;
    const childMin = parentHeight - childHeight
    childTopEnd.current = clamp(childTopEnd.current + value, childMin, 0);

    if (childTopEnd.current === childTopStart.current) return;

    if (!timer.isStartContinue) {
      timer.startContinous(alpha => {
        const top = lerp(childTopStart.current, childTopEnd.current, alpha)
        const ScrollHeight = (scrollHeight - parentHeight) * (-top / childMin);
        if (rootRef.current && rootRef.current.firstElementChild)
          (rootRef.current.firstElementChild as HTMLDivElement).style.top = `${top}px`;
        if (scrollRef.current)
          scrollRef.current.style.top = `${ScrollHeight}px`;
        current.current = ScrollHeight;
      }, () => {
        childTopStart.current = childTopEnd.current;
      })
    }
  }

  const goToElement = (element: any) => {
    const containerHeight = rootRef.current ? rootRef.current.clientHeight : 0;

    const children = rootRef.current ? rootRef.current.children : [];
    const firstRect = children[0].getBoundingClientRect();
    const targetRect = element.getBoundingClientRect();

    const distance = firstRect.top - (targetRect.top + targetRect.height) + containerHeight
    handleMovement(distance - childTopEnd.current)
  }

  const handleMouseUp = (e: MouseEvent) => {
    setTimeout(() => {
      if (props.dispatcher) props.dispatcher.clickDown = false;
    }, 0);
    isActive.current = false;
    current.current = scrollRef.current ? scrollRef.current.offsetTop : 0;
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isActive.current) {
      e.preventDefault();
      if (!rootRef.current || !rootRef.current.parentElement) return;
      if (!rootRef.current || !rootRef.current.firstElementChild) return;
      if (!scrollRef.current) return;
      const parentHeight = rootRef.current.parentElement.clientHeight;
      const childHeight = rootRef.current.firstElementChild.clientHeight;
      const scrollHeight = scrollRef.current.clientHeight;

      const scrollMax = parentHeight - scrollHeight;
      const childMin = parentHeight - childHeight

      const currentLocal = clamp((e.clientY - start.current) + current.current, 0, scrollMax);
      const childTop = childMin * (currentLocal / scrollMax);

      scrollRef.current.style.top = `${currentLocal}px`;
      (rootRef.current.firstElementChild as HTMLDivElement).style.top = `${childTop}px`;

      childTopEnd.current = childTopStart.current = childTop;
    }
  }

  const handleResize = () => {
    if (
      !rootRef.current
      || !rootRef.current.parentElement
      || !rootRef.current.firstElementChild
      || !scrollRef.current) return;
    const parentHeight = rootRef.current.parentElement.clientHeight;
    const childHeight = rootRef.current.firstElementChild.clientHeight;

    if (parentHeight / childHeight > 1) {
      scrollRef.current.style.height = `0px`;
    } else {
      const scrollSize = (parentHeight / childHeight) * parentHeight;
      scrollRef.current.style.height = `${scrollSize}px`;
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (props.dispatcher) props.dispatcher.clickDown = true;
    isActive.current = true;
    start.current = e.clientY
    timer.cancelAnimation();
  }

  const handleWeel = (e: React.WheelEvent<HTMLDivElement>) => {
    let value = -1;
    if (e.deltaY < 0) {
      value = 1;
    }
    value *= 50;

    handleMovement(value);
  }

  const handleScrollMouseEnter = () => {
    if (!scrollRef.current || !scrollRef.current.firstElementChild) return
    (scrollRef.current.firstElementChild as HTMLDialogElement).style.backgroundColor = '#fff';
    (scrollRef.current.firstElementChild as HTMLDialogElement).style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.55), 0 6px 20px 0 rgba(0, 0, 0, 0.55)';
  }
  const handleScrollMouseLeave = () => {
    if (!scrollRef.current || !scrollRef.current.firstElementChild) return
    (scrollRef.current.firstElementChild as HTMLDialogElement).style.backgroundColor = '#aaa';
    (scrollRef.current.firstElementChild as HTMLDialogElement).style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.15), 0 6px 20px 0 rgba(0, 0, 0, 0.15)';
  }


  React.useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)

    if (props.dispatcher)
      props.dispatcher.moveTo = goToElement;

    handleResize();
    childrenLength.current = props.children.props.children.length;
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, []);

  React.useEffect(() => {
    const currentChLength = props.children.props.children.length;
    if (childrenLength.current !== currentChLength) {
      childrenLength.current = currentChLength
      handleResize();
    }
  }, [props.children]);

  return (
    <div style={{
      width: '100%',
      position: 'absolute',
      height: `calc(100% - ${iniTop}px)`,
      top: iniTop
    }}>
      <div
        ref={rootRef as any}
        onWheel={handleWeel}
        onScroll={e => e.preventDefault()}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        {props.children}
        <div
          className={classes.root}
          ref={scrollRef as any}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleScrollMouseEnter}
          onMouseLeave={handleScrollMouseLeave}

        >
          <div className={classes.inner} />
        </div>
      </div>
    </div>
  )
}

export default Scroll;