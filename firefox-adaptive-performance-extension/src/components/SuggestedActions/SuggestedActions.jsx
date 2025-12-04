import * as React from "react";
import { Accordion } from "radix-ui";
import classNames from "classnames";
import { ChevronDownIcon } from "@radix-ui/react-icons";
// import "./styles.css";
import './SuggestedActions.css';
import { IoIosClose } from "react-icons/io";
// import styles from './SuggestedActions.module.css'

const AccordionDemo = () => (
	<Accordion.Root
		className="AccordionRoot"
		type="single"
		// defaultValue="item-1"
		collapsible
	>
		<Accordion.Item className="AccordionItem" value="item-1">
			<AccordionTrigger>Suggested Actions</AccordionTrigger>
			
				<AccordionContent>
					<p>This tab has not been used in 10 days. Close or sleep tab?</p>
					
					<IoIosClose size={12}/>

				</AccordionContent>


				<AccordionContent className="AccordionContent2">
					<p>These tabs have been inactive for 3 days and taking up significant CPU space.</p>
					
					<IoIosClose className="CloseIcon"/>

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

export default AccordionDemo;
