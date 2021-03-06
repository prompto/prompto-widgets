package prompto.utils.prop_types_extractor;

import static prompto.utils.prop_types_extractor.PropTypesConstants.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import prompto.property.IPropertyValidator;

public class ReactBootstrap3PropTypes {

	@SuppressWarnings("serial")
	public static Map<String, Map<String, IPropertyValidator>> VALIDATORS = new HashMap<String, Map<String, IPropertyValidator>>() {
		{
			put("CarouselItem", Collections.singletonMap("onAnimateOutEnd", CALLBACK_VALIDATOR));
			put("Panel", new HashMap<String, IPropertyValidator>() {
				{
					put("onToggle", TOGGLE_CHANGED_VALIDATOR);
					put("onSelect", CALLBACK_VALIDATOR);
				}
			});
			put("PanelGroup", Collections.singletonMap("onSelect", ITEM_SELECTED_VALIDATOR));
			put("PaginationButton", Collections.singletonMap("onSelect", CALLBACK_VALIDATOR));
			put("Navbar", new HashMap<String, IPropertyValidator>() {
				{
					put("onToggle", TOGGLE_CHANGED_VALIDATOR);
					put("onSelect", ITEM_SELECTED_VALIDATOR);
				}
			});
			put("NavItem", Collections.singletonMap("onSelect", ITEM_SELECTED_VALIDATOR));
			put("Collapse", Collections.singletonMap("getDimensionValue", ANY_TYPE_VALIDATOR)); // TBD: proto is m(dimension, element)
			put("Tabs", Collections.singletonMap("onSelect", ITEM_SELECTED_VALIDATOR));
			put("TabContainer", new HashMap<String, IPropertyValidator>() {
				{
					put("generateChildId", ANY_TYPE_VALIDATOR); // TBD: no proto
					put("onSelect", ITEM_SELECTED_VALIDATOR);
				}
			});
			put("DropdownMenu", Collections.singletonMap("onSelect", ITEM_SELECTED_VALIDATOR));
			put("Pagination", Collections.singletonMap("onSelect", ITEM_SELECTED_VALIDATOR));
			put("Pager", Collections.singletonMap("onSelect", CALLBACK_VALIDATOR));
			put("PagerItem", Collections.singletonMap("onSelect", CALLBACK_VALIDATOR));
			put("Nav", Collections.singletonMap("onSelect", ITEM_SELECTED_VALIDATOR));
			put("MenuItem", Collections.singletonMap("onSelect", ITEM_SELECTED_VALIDATOR));
			put("Dropdown", new HashMap<String, IPropertyValidator>() {
				{
					put("onToggle", ANY_TYPE_VALIDATOR); // TBD: no proto
					put("onSelect", ITEM_SELECTED_VALIDATOR);
				}
			});
			put("FormControl", Collections.singletonMap("inputRef", WIDGET_REF_VALIDATOR));
			put("Checkbox", Collections.singletonMap("inputRef", WIDGET_REF_VALIDATOR));
			put("Radio", Collections.singletonMap("inputRef", WIDGET_REF_VALIDATOR));
			put("ProgressBar", Collections.singletonMap("children", HTML_TYPE_VALIDATOR));
			put("ToggleButtonGroup", Collections.singletonMap("onChange", ANY_TYPE_VALIDATOR)); // can be atomic or list values depending on type 'checkbox' or 'radio'
			put("ToggleButton", Collections.singletonMap("onChange", ANY_TYPE_VALIDATOR)); // can be atomic or list values depending on type 'checkbox' or 'radio'
			put("Carousel", new HashMap<String, IPropertyValidator>() {
				{
					put("onSelect", ITEM_SELECTED_VALIDATOR);
					put("onSlideEnd", CALLBACK_VALIDATOR);
				}
			});
			put("Modal", Collections.singletonMap("container", ANY_TYPE_VALIDATOR)); // private
		}
	};

}