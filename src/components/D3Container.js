import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { select } from "d3";

function useResize(timeout) {
    const ref = useRef();
    const [ size, setSize ] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        if(!ref.current) return;

        // Sets dimensions state after [timeout] ms.
        const resizeHandler = debounce(() => {
            setSize({
                width: ref.current.offsetWidth,
                height: ref.current.offsetHeight
            });
        }, timeout);
        
        // Initialize the referenced DOM element's dimensions.
        resizeHandler();

        // Add the event listener to the window.
        window.addEventListener('resize', resizeHandler);

        // Remove the event listener upon unmount.
        return () => window.removeEventListener("resize", resizeHandler);
    }, [ ref.current, timeout ]);

    return { containerRef: ref, size };
}

const D3Container = React.forwardRef(({ id, viz, config = {}, data, containerStyle, resizeTimeout = 100, stage}, vizRef) => {
    const { containerRef, size } = useResize(resizeTimeout);
    const firstRender = useRef(true);
    // Upon first mount, initialize visualization with initial configuration.
    useEffect(() => {
        config = {
            ...config, 
            id,
            data,
            stage
        }
        // Initialize the visualization closure with an optional configuration.
        var chart = viz(config);

        // Store the reference to the visualization to easily expose getters/setters.
        vizRef.current = chart;
        // Use selection.call to attach visualization to selected DOM element (the container div).
        select(containerRef.current)
            .call(chart);

        firstRender.current = false;
    }, []);

    // Upon a resize event, set the visualization size to the proper dimensions.
    useLayoutEffect(() => {
        if(!vizRef.current || firstRender.current) return;
        vizRef.current.size(size.width, size.height);
    }, [ size ]);

    // Upon a change of data, propagate the updated data down to the visualization.
    // useEffect(() => {
    //     if(!vizRef.current || firstRender.current) return;
    //     vizRef.current.data(data);
    // }, [ data ]);

    useEffect(() => {
        if(!vizRef.current || firstRender.current)  return;
        vizRef.current.stage(stage)
    }, [ stage ])



    return (
        <div id={id} ref={containerRef} style={{ height: "100%", width: "100%", ...containerStyle }}>
            <svg width={size.width} height={size.height} />
        </div>
    )
});

export default D3Container;