import * as React from "react";
import { Accordion } from "radix-ui";
import classNames from "classnames";
import { ChevronDownIcon } from "@radix-ui/react-icons";
// import "./styles.css";
import './SuggestedActions.css';
import { IoIosClose } from "react-icons/io";
import TabCard from "../TabCard/TabCard";
// import styles from './SuggestedActions.module.css'

	// Sample tab data
  const sampleTab = {
	id: 1,
	title: "Google Search for Daniel Lee",
	icon: "https://www.google.com/favicon.ico",
	memory: "23 MB",
	cpu: "1%",
	lastUsed: "3 Days Ago",
	isSleeping: false
  };

  // Handler functions
  const handleSleep = (id) => {
	console.log(`Sleep clicked for tab ${id}`);
	// Add your sleep logic here
  };

  const handleClose = (id) => {
	console.log(`Close clicked for tab ${id}`);
	// Add your close logic here
  };

const SuggestedActions = () => (
	<Accordion.Root
		className="AccordionRoot"
		type="single"
		// defaultValue="item-1"
		collapsible
	>
		<Accordion.Item className="AccordionItem" value="item-1">
			<AccordionTrigger>Suggested Actions</AccordionTrigger>
			
				<AccordionContent>
					<div className="blahblah">
						<p className="textcustom">This tab has not been used in 10 days. Close or sleep tab?</p>
					{/* Single TabCard Example */}
      					<div style={{ padding: '0px', maxWidth: '400px' }}>
        					<TabCard
          						tab={sampleTab}
          						sortBy="Memory Usage"
          						onSleep={handleSleep}
          						onClose={handleClose}
        						/>
      					</div>

					</div>
					
				
				</AccordionContent>


				<AccordionContent className="AccordionContent2">
					
					<div className="blahblah">
					<p>These tabs have been inactive for 3 days and taking up significant CPU space.</p>
					
					{/* Single TabCard Example */}
      					<div style={{ padding: '0px', maxWidth: '400px' }}>
        					<TabCard
          						tab={sampleTab}
          						sortBy="Memory Usage"
          						onSleep={handleSleep}
          						onClose={handleClose}
        						/>
      					</div>
						{/* Single TabCard Example */}
      					<div style={{ padding: '0px', maxWidth: '400px' }}>
        					<TabCard
          						tab={sampleTab}
          						sortBy="Memory Usage"
          						onSleep={handleSleep}
          						onClose={handleClose}
        						/>
      					</div>
					</div>

				</AccordionContent>

			
		</Accordion.Item>
	</Accordion.Root>
);

const AccordionTrigger = React.forwardRef(
	({ children, className, ...props }, forwardedRef) => (
		<Accordion.Header className="AccordionHeader">
			<Accordion.Trigger
				className={classNames("AccordionTrigger", className)}
				{...props}
				ref={forwardedRef}
			>
				{children}
				<ChevronDownIcon className="AccordionChevron" aria-hidden />
			</Accordion.Trigger>
		</Accordion.Header>
	),
);

const AccordionContent = React.forwardRef(
	({ children, className, ...props }, forwardedRef) => (
		<Accordion.Content
			className={classNames("AccordionContent", className)}
			{...props}
			ref={forwardedRef}
		>
			<div className="AccordionContentText">{children}</div>
		</Accordion.Content>
	),
);

export default SuggestedActions;
